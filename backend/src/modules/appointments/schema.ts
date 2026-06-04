import { z } from 'zod';

export const APPOINTMENT_STATUSES = ['agendado', 'confirmado', 'concluido', 'cancelado', 'atendimento'] as const;

const base = z.object({
  patientId: z.string().min(1, 'Paciente obrigatório.'),
  dentistId: z.string().min(1, 'Dentista obrigatório.'),
  serviceId: z.string().optional().nullable(),

  // Either datetime (ISO) OR date + time (frontend agenda)
  datetime: z.coerce.date().optional(),
  date: z.string().optional(), // YYYY-MM-DD
  time: z.string().optional(), // HH:mm

  // durationMin (canonical) / dur (frontend)
  durationMin: z.coerce.number().int().min(5).optional(),
  dur: z.coerce.number().int().min(5).optional(),

  status: z.enum(APPOINTMENT_STATUSES).optional().default('agendado'),
  notes: z.string().optional().nullable(),
});

export const createAppointmentSchema = base.refine(
  (d) => d.datetime || (d.date && d.time),
  { message: 'Informe datetime ou (date + time).', path: ['datetime'] },
);

export const updateAppointmentSchema = base.partial();

export const updateStatusSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES),
});

export const listAppointmentsQuerySchema = z.object({
  date: z.string().optional(), // YYYY-MM-DD (single day)
  dentistId: z.string().optional(),
  status: z.enum([...APPOINTMENT_STATUSES, 'all']).optional(),
  patientId: z.string().optional(),
});

export const agendaQuerySchema = z.object({
  start: z.string().min(1, 'Parâmetro "start" obrigatório.'),
  end: z.string().min(1, 'Parâmetro "end" obrigatório.'),
  dentistId: z.string().optional(),
});

const attachServiceItem = z.object({
  serviceId: z.string().min(1),
  priceOverride: z.coerce.number().min(0).optional().nullable(),
  quantity: z.coerce.number().int().min(1).optional().default(1),
});

export const attachServicesSchema = z.union([
  z.object({ services: z.array(attachServiceItem).min(1) }),
  attachServiceItem, // allow a single item body
]);

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
