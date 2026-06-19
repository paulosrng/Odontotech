import fs from 'fs';
import path from 'path';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { NotFound } from '../../shared/errors';
import { toDateString } from '../../shared/dates';
import { env } from '../../config/env';
import type { ExamDTO } from './types';
import type { CreateExamInput, UpdateExamInput } from './schema';

const include = { patient: true, dentist: true, files: true } satisfies Prisma.ExamInclude;
type ExamFull = Prisma.ExamGetPayload<{ include: typeof include }>;

function serialize(e: ExamFull): ExamDTO {
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
    attachments: e.files.map((f) => ({
      id: f.id,
      filename: f.filename,
      originalName: f.originalName,
      url: `/${f.path.replace(/\\/g, '/')}`,
      path: f.path,
      mimeType: f.mimeType,
      size: f.size,
    })),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

export interface UploadedFile {
  filename: string;
  originalname: string;
  path: string;
  mimetype: string;
  size: number;
}

function toFileRecords(examFiles: UploadedFile[]) {
  return examFiles.map((f) => ({
    filename: f.filename,
    originalName: f.originalname,
    // store a relative path (uploads/xyz.jpg) so it can be served statically
    path: path.join(env.uploads.dir, f.filename).replace(/\\/g, '/'),
    mimeType: f.mimetype,
    size: f.size,
  }));
}

export const examService = {
  async listByPatient(patientId: string, params: { skip: number; take: number; status?: string }) {
    const where: Prisma.ExamWhereInput = { patientId };
    if (params.status && params.status !== 'all') where.status = params.status;
    const [rows, total] = await Promise.all([
      prisma.exam.findMany({ where, include, orderBy: { date: 'desc' }, skip: params.skip, take: params.take }),
      prisma.exam.count({ where }),
    ]);
    return { data: rows.map(serialize), total };
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
    return { data: rows.map(serialize), total };
  },

  async create(patientId: string, input: CreateExamInput, files: UploadedFile[] = [], clinicId = 'demo') {
    // ensure patient exists
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw NotFound('Paciente');

    const fileRecords = toFileRecords(files);
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

    const fileRecords = toFileRecords(files);
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

    // best-effort delete of physical files
    for (const f of exam.files) {
      const abs = path.resolve(process.cwd(), f.path);
      fs.promises.unlink(abs).catch(() => undefined);
    }
    await prisma.exam.delete({ where: { id } });
  },
};
