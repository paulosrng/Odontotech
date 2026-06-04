import { z } from 'zod';

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

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type LogoutInput = z.infer<typeof logoutSchema>;
