import { z } from 'zod';
import { parseYmdLocal } from '../../shared/dates';

export const EXAM_STATUSES = ['pendente', 'concluido'] as const;

const dateLocal = z.preprocess(
  (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? parseYmdLocal(v) : v),
  z.coerce.date(),
);

const base = z.object({
  patientId: z.string().optional(), // also taken from route param
  dentistId: z.string().optional().nullable(),
  type: z.string().min(1, 'Tipo de exame obrigatório.'),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  date: dateLocal,
  status: z.enum(EXAM_STATUSES).optional().default('pendente'),
});

export const createExamSchema = base;

export const updateExamSchema = base.partial();

export const listExamsQuerySchema = z.object({
  search: z.string().optional(),
  q: z.string().optional(),
  status: z.enum([...EXAM_STATUSES, 'all']).optional(),
  patientId: z.string().optional(),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
