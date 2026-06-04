import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { NotFound } from '../../shared/errors';
import { parseStringArray, stringifyArray } from '../../shared/pagination';
import { calcAge, toDateString } from '../../shared/dates';
import type { PatientDTO } from './types';
import type { CreatePatientInput, UpdatePatientInput } from './schema';

type PatientWithRelations = Prisma.PatientGetPayload<{ include: { plan: true } }>;

function serialize(
  p: PatientWithRelations,
  extras?: { lastVisit?: string | null; nextVisit?: string | null; consultations?: number },
): PatientDTO {
  return {
    id: p.id,
    name: p.name,
    cpf: p.cpf,
    rg: p.rg,
    birth: toDateString(p.birthdate),
    birthdate: p.birthdate.toISOString(),
    age: calcAge(p.birthdate),
    gender: p.gender,
    phone: p.phone,
    email: p.email,
    cep: p.cep,
    address: p.address,
    city: p.city,
    uf: p.uf,
    status: p.status,
    planId: p.planId,
    planName: p.plan?.name ?? null,
    allergies: parseStringArray(p.allergies),
    conditions: parseStringArray(p.conditions),
    observations: p.observations,
    obs: p.observations,
    isMinor: p.isMinor,
    responsible: p.responsibleParty,
    responsibleParty: p.responsibleParty,
    responsiblePhone: p.responsiblePhone,
    lastVisit: extras?.lastVisit ?? null,
    nextVisit: extras?.nextVisit ?? null,
    consultations: extras?.consultations ?? 0,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

/** Compute lastVisit / nextVisit / consultations from a patient's appointments. */
async function visitStats(patientId: string) {
  const now = new Date();
  const [completedCount, last, next] = await Promise.all([
    prisma.appointment.count({ where: { patientId, status: 'concluido' } }),
    prisma.appointment.findFirst({
      where: { patientId, datetime: { lte: now }, status: { in: ['concluido', 'atendimento'] } },
      orderBy: { datetime: 'desc' },
    }),
    prisma.appointment.findFirst({
      where: { patientId, datetime: { gte: now }, status: { in: ['agendado', 'confirmado'] } },
      orderBy: { datetime: 'asc' },
    }),
  ]);
  return {
    consultations: completedCount,
    lastVisit: last ? toDateString(last.datetime) : null,
    nextVisit: next ? toDateString(next.datetime) : null,
  };
}

function buildData(input: Partial<CreatePatientInput>): Prisma.PatientUncheckedCreateInput | Prisma.PatientUncheckedUpdateInput {
  const data: Record<string, unknown> = { ...input };
  if (input.allergies !== undefined) data.allergies = stringifyArray(input.allergies);
  if (input.conditions !== undefined) data.conditions = stringifyArray(input.conditions);
  if (input.planId === undefined) delete data.planId;
  return data as any;
}

export const patientService = {
  async list(params: {
    search?: string;
    status?: string;
    planId?: string;
    sort: string;
    dir: 'asc' | 'desc';
    skip: number;
    take: number;
  }) {
    const where: Prisma.PatientWhereInput = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { cpf: { contains: params.search } },
        { phone: { contains: params.search } },
      ];
    }
    if (params.status && params.status !== 'all') where.status = params.status;
    if (params.planId && params.planId !== 'all') where.planId = params.planId;

    // "age" & "lastVisit" aren't DB columns — fall back to a stable order for those.
    const orderBy: Prisma.PatientOrderByWithRelationInput =
      params.sort === 'name'
        ? { name: params.dir }
        : params.sort === 'status'
          ? { status: params.dir }
          : params.sort === 'age'
            ? { birthdate: params.dir === 'asc' ? 'desc' : 'asc' } // older = lower birthdate
            : params.sort === 'createdAt'
              ? { createdAt: params.dir }
              : { name: 'asc' };

    const [rows, total] = await Promise.all([
      prisma.patient.findMany({ where, include: { plan: true }, orderBy, skip: params.skip, take: params.take }),
      prisma.patient.count({ where }),
    ]);

    const data = await Promise.all(
      rows.map(async (p) => serialize(p, await visitStats(p.id))),
    );
    return { data, total };
  },

  async getById(id: string): Promise<PatientDTO & { lastAppointments: unknown[]; exams: unknown[] }> {
    const p = await prisma.patient.findUnique({ where: { id }, include: { plan: true } });
    if (!p) throw NotFound('Paciente');

    const [stats, lastAppointments, exams] = await Promise.all([
      visitStats(id),
      prisma.appointment.findMany({
        where: { patientId: id },
        orderBy: { datetime: 'desc' },
        take: 6,
        include: { dentist: true, service: true },
      }),
      prisma.exam.findMany({
        where: { patientId: id },
        orderBy: { date: 'desc' },
        take: 10,
        include: { files: true, dentist: true },
      }),
    ]);

    return {
      ...serialize(p, stats),
      lastAppointments: lastAppointments.map((a) => ({
        id: a.id,
        date: toDateString(a.datetime),
        hour: a.datetime.getHours(),
        min: a.datetime.getMinutes(),
        status: a.status,
        serviceName: a.service?.name ?? null,
        dentistName: a.dentist?.name ?? null,
        notes: a.notes,
      })),
      exams: exams.map((e) => ({
        id: e.id,
        type: e.type,
        date: toDateString(e.date),
        status: e.status,
        files: e.files.length,
        notes: e.notes,
        dentistName: e.dentist?.name ?? null,
      })),
    };
  },

  async create(input: CreatePatientInput): Promise<PatientDTO> {
    const created = await prisma.patient.create({
      data: buildData(input) as Prisma.PatientUncheckedCreateInput,
      include: { plan: true },
    });
    return serialize(created, { consultations: 0, lastVisit: null, nextVisit: null });
  },

  async update(id: string, input: UpdatePatientInput): Promise<PatientDTO> {
    await prisma.patient.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw NotFound('Paciente');
    });
    const updated = await prisma.patient.update({
      where: { id },
      data: buildData(input) as Prisma.PatientUncheckedUpdateInput,
      include: { plan: true },
    });
    return serialize(updated, await visitStats(id));
  },

  async remove(id: string): Promise<void> {
    await prisma.patient.delete({ where: { id } }).catch(() => {
      throw NotFound('Paciente');
    });
  },
};
