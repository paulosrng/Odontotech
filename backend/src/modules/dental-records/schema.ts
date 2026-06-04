import { z } from 'zod';

export const updateDentalRecordSchema = z.object({
  notes: z.string().optional().nullable().default(''),
});

export type UpdateDentalRecordInput = z.infer<typeof updateDentalRecordSchema>;
