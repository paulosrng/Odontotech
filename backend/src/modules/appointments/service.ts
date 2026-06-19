import type { Prisma } from '@prisma/client';
import { prisma } from '../../shared/prisma';
import { BadRequest, NotFound } from '../../shared/errors';
import { combineDateTime, toDateString } from '../../shared/dates';
import type { AppointmentDTO } from './types';
import type { CreateAppointmentInput, UpdateAppointmentInput } from './schema';

const include = {
  patient: { include: { plan: true } },
  dentist: true,
  service: true,
  services: { include: { service: true } },
} satisfies Prisma.AppointmentInclude;

type AppointmentFull = Prisma.AppointmentGetPayload<{ include: typeof include }>;

function serialize(a: AppointmentFull): AppointmentDTO {
  const services = a.services.map((s) => ({
    id: s.id,
    serviceId: s.serviceId,
    serviceName: s.service.name,
    price: s.priceOverride ?? s.service.price,
    priceOverride: s.priceOverride,
    quantity: s.quantity,
  }));
  const total = services.reduce((sum, s) => sum + s.price * s.quantity, 0);

  return {
    id: a.id,
    date: toDateString(a.datetime),
    hour: a.datetime.getHours(),
    min: a.datetime.getMinutes(),
    dur: a.durationMin,
    durationMin: a.durationMin,
    datetime: a.datetime.toISOString(),
    patientId: a.patientId,
    patientName: a.patient?.name ?? '',
    dentistId: a.dentistId,
    dentistName: a.dentist?.name ?? '',
    serviceId: a.serviceId,
    serviceName: a.service?.name ?? null,
    status: a.status,
    planName: a.patient?.plan?.name ?? null,
    notes: a.notes,
    services,
    total,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

function dayRange(date: string): { gte: Date; lt: Date } {
  const [y, m, d] = date.split('-').map(Number);
  const gte = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  const lt = new Date(y, (m || 1) - 1, (d || 1) + 1, 0, 0, 0, 0);
  return { gte, lt };
}

async function resolveDateTime(input: { datetime?: Date; date?: string; time?: string }): Promise<Date> {
  if (input.datetime) return input.datetime;
  if (input.date && input.time) return combineDateTime(input.date, input.time);
  throw BadRequest('Data/hora inválida.');
}

export const appointmentService = {
  async list(params: {
    clinicId: string;
    date?: string;
    dentistId?: string;
    status?: string;
    patientId?: string;
    skip: number;
    take: number;
  }) {
    const where: Prisma.AppointmentWhereInput = { clinicId: params.clinicId };
    if (params.date) where.datetime = dayRange(params.date);
    if (params.dentistId && params.dentistId !== 'all') where.dentistId = params.dentistId;
    if (params.status && params.status !== 'all') where.status = params.status;
    if (params.patientId) where.patientId = params.patientId;

    const [rows, total] = await Promise.all([
      prisma.appointment.findMany({ where, include, orderBy: { datetime: 'asc' }, skip: params.skip, take: params.take }),
      prisma.appointment.count({ where }),
    ]);
    return { data: rows.map(serialize), total };
  },

  /** Agenda range — returns every appointment between start and end (no pagination). */
  async agenda(params: { clinicId: string; start: string; end: string; dentistId?: string }) {
    const { gte } = dayRange(params.start);
    const { lt } = dayRange(params.end);
    const where: Prisma.AppointmentWhereInput = { clinicId: params.clinicId, datetime: { gte, lt } };
    if (params.dentistId && params.dentistId !== 'all') where.dentistId = params.dentistId;

    const rows = await prisma.appointment.findMany({ where, include, orderBy: { datetime: 'asc' } });
    return rows.map(serialize);
  },

  async getById(id: string) {
    const a = await prisma.appointment.findUnique({ where: { id }, include });
    if (!a) throw NotFound('Consulta');
    return serialize(a);
  },

  async create(clinicId: string, input: CreateAppointmentInput) {
    const datetime = await resolveDateTime(input);

    // Default duration from the chosen service if not provided.
    let durationMin = input.durationMin ?? input.dur;
    if (!durationMin && input.serviceId) {
      const svc = await prisma.service.findUnique({ where: { id: input.serviceId } });
      durationMin = svc?.duration ?? 30;
    }

    const created = await prisma.appointment.create({
      data: {
        clinicId,
        patientId: input.patientId,
        dentistId: input.dentistId,
        serviceId: input.serviceId || null,
        datetime,
        durationMin: durationMin ?? 30,
        status: input.status ?? 'agendado',
        notes: input.notes ?? null,
      },
      include,
    });
    return serialize(created);
  },

  async update(id: string, input: UpdateAppointmentInput) {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) throw NotFound('Consulta');

    const data: Prisma.AppointmentUncheckedUpdateInput = {};
    if (input.patientId !== undefined) data.patientId = input.patientId;
    if (input.dentistId !== undefined) data.dentistId = input.dentistId;
    if (input.serviceId !== undefined) data.serviceId = input.serviceId || null;
    if (input.status !== undefined) data.status = input.status;
    if (input.notes !== undefined) data.notes = input.notes ?? null;
    if (input.durationMin !== undefined || input.dur !== undefined) data.durationMin = input.durationMin ?? input.dur;
    if (input.datetime || (input.date && input.time)) {
      data.datetime = await resolveDateTime(input);
    }

    const updated = await prisma.appointment.update({ where: { id }, data, include });
    return serialize(updated);
  },

  async updateStatus(id: string, status: string) {
    const updated = await prisma.appointment
      .update({ where: { id }, data: { status }, include })
      .catch(() => {
        throw NotFound('Consulta');
      });
    return serialize(updated);
  },

  async remove(id: string) {
    await prisma.appointment.delete({ where: { id } }).catch(() => {
      throw NotFound('Consulta');
    });
  },

  /** Attach one or more services to an appointment ("Associar à consulta"). */
  async attachServices(
    appointmentId: string,
    items: { serviceId: string; priceOverride?: number | null; quantity?: number }[],
  ) {
    const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt) throw NotFound('Consulta');

    for (const item of items) {
      await prisma.appointmentService.upsert({
        where: { appointmentId_serviceId: { appointmentId, serviceId: item.serviceId } },
        create: {
          appointmentId,
          serviceId: item.serviceId,
          priceOverride: item.priceOverride ?? null,
          quantity: item.quantity ?? 1,
        },
        update: {
          priceOverride: item.priceOverride ?? null,
          quantity: item.quantity ?? 1,
        },
      });
    }

    const updated = await prisma.appointment.findUnique({ where: { id: appointmentId }, include });
    return serialize(updated!);
  },
};
