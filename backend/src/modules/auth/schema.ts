import { z } from 'zod';

export const registerSchema = z.object({
  clinicName: z.string().min(2, 'Nome da clínica obrigatório.'),
  name: z.string().min(2, 'Seu nome é obrigatório.'),
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.'),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha obrigatória.'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token obrigatório.'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token obrigatório.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
