import path from 'path';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { NotFound } from '../../shared/errors';
import { toDateString } from '../../shared/dates';
import { uploadObject, signedUrl, deleteObjects } from '../../shared/storage';
import type { ExamDTO } from './types';
import type { CreateExamInput, UpdateExamInput } from './schema';

const include = { patient: true, dentist: true, files: true } satisfies Prisma.ExamInclude;
type ExamFull = Prisma.ExamGetPayload<{ include: typeof include }>;

async function serialize(e: ExamFull): Promise<ExamDTO> {
  const attachments = await Promise.all(
    e.files.map(async (f) => ({
      id: f.id,
      filename: f.filename,
      originalName: f.originalName,
      url: await signedUrl(f.path),
      path: f.path,
      mimeType: f.mimeType,
      size: f.size,
    })),
  );
  return {
    id: e.id,
    patientId: e.patientId,
    patientName: e.patient?.name ?? null,
    dentistId: e.dentistId,
    dentistName: e.dentist?.name ?? null,
    type: e.type,
    description: e.description,
    notes: e.notes,
    date: toDateString(e.date),
    status: e.status,
    filePath: e.filePath,
    files: e.files.length,
    attachments,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

const serializeMany = (rows: ExamFull[]) => Promise.all(rows.map(serialize));

export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

/** Upload each incoming file to Supabase Storage and build the DB rows. */
async function uploadAndBuildRecords(examFiles: UploadedFile[]) {
  const records = [];
  for (const f of examFiles) {
    const ext = path.extname(f.originalname).toLowerCase();
    const base = path
      .basename(f.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 40);
    const objectName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`;
    await uploadObject({ buffer: f.buffer, objectName, mimeType: f.mimetype });
    records.push({
      filename: objectName,
      originalName: f.originalname,
      path: objectName, // object path within the Storage bucket
      mimeType: f.mimetype,
      size: f.size,
    });
  }
  return records;
}

export const examService = {
  async listByPatient(patientId: string, params: { skip: number; take: number; status?: string }) {
    const where: Prisma.ExamWhereInput = { patientId };
    if (params.status && params.status !== 'all') where.status = params.status;
    const [rows, total] = await Promise.all([
      prisma.exam.findMany({ where, include, orderBy: { date: 'desc' }, skip: params.skip, take: params.take }),
      prisma.exam.count({ where }),
    ]);
    return { data: await serializeMany(rows), total };
  },

  async listAll(params: { clinicId: string; search?: string; status?: string; patientId?: string; skip: number; take: number }) {
    const where: Prisma.ExamWhereInput = { clinicId: params.clinicId };
    if (params.patientId) where.patientId = params.patientId;
    if (params.status && params.status !== 'all') where.status = params.status;
    if (params.search) {
      where.OR = [
        { type: { contains: params.search } },
        { patient: { name: { contains: params.search } } },
      ];
    }
    const [rows, total] = await Promise.all([
      prisma.exam.findMany({ where, include, orderBy: { date: 'desc' }, skip: params.skip, take: params.take }),
      prisma.exam.count({ where }),
    ]);
    return { data: await serializeMany(rows), total };
  },

  async create(patientId: string, input: CreateExamInput, files: UploadedFile[] = [], clinicId = 'demo') {
    // ensure patient exists
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw NotFound('Paciente');

    const fileRecords = await uploadAndBuildRecords(files);
    const exam = await prisma.exam.create({
      data: {
        clinicId,
        patientId,
        dentistId: input.dentistId || null,
        type: input.type,
        description: input.description ?? null,
        notes: input.notes ?? null,
        date: input.date,
        status: input.status ?? 'pendente',
        filePath: fileRecords[0]?.path ?? null,
        files: { create: fileRecords },
      },
      include,
    });
    return serialize(exam);
  },

  async update(id: string, input: UpdateExamInput, files: UploadedFile[] = []) {
    const existing = await prisma.exam.findUnique({ where: { id }, include });
    if (!existing) throw NotFound('Exame');

    const fileRecords = await uploadAndBuildRecords(files);
    const data: Prisma.ExamUncheckedUpdateInput = {};
    if (input.dentistId !== undefined) data.dentistId = input.dentistId || null;
    if (input.type !== undefined) data.type = input.type;
    if (input.description !== undefined) data.description = input.description ?? null;
    if (input.notes !== undefined) data.notes = input.notes ?? null;
    if (input.date !== undefined) data.date = input.date;
    if (input.status !== undefined) data.status = input.status;
    if (fileRecords.length) {
      data.files = { create: fileRecords };
      if (!existing.filePath) data.filePath = fileRecords[0].path;
    }

    const updated = await prisma.exam.update({ where: { id }, data, include });
    return serialize(updated);
  },

  async remove(id: string) {
    const exam = await prisma.exam.findUnique({ where: { id }, include: { files: true } });
    if (!exam) throw NotFound('Exame');

    // best-effort delete of the stored objects, then the DB rows
    await deleteObjects(exam.files.map((f) => f.path));
    await prisma.exam.delete({ where: { id } });
  },
};
