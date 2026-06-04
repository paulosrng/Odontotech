import { z } from 'zod';

export const ROLES = ['ADMIN', 'DENTIST'] as const;

export const updateSettingsSchema = z.object({
  clinicName: z.string().min(1).optional(),
  unit: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  radius: z.enum(['sharp', 'default', 'rounded']).optional(),
  density: z.enum(['comfortable', 'compact']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  businessHoursStart: z.string().optional(),
  businessHoursEnd: z.string().optional(),
  appointmentSlotMinutes: z.coerce.number().int().min(5).max(240).optional(),
  timezone: z.string().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres.'),
  role: z.enum(ROLES).default('DENTIST'),
  specialty: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  initials: z.string().max(3).optional().nullable(),
  active: z.coerce.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(ROLES).optional(),
  specialty: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  initials: z.string().max(3).optional().nullable(),
  active: z.coerce.boolean().optional(),
});

export const listUsersQuerySchema = z.object({
  role: z.enum([...ROLES, 'all']).optional(),
  search: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
