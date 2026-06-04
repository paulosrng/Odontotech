import { Request, Response } from 'express';
import { ok } from '../../shared/response';
import { authService } from './service';
import { loginSchema, logoutSchema, refreshSchema } from './schema';

export const authController = {
  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);
    return ok(res, result, 'Login realizado com sucesso.');
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refresh(refreshToken);
    return ok(res, result, 'Tokens renovados.');
  },

  async logout(req: Request, res: Response) {
    const { refreshToken } = logoutSchema.parse(req.body);
    await authService.logout(refreshToken);
    return ok(res, null, 'Sessão encerrada.');
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.id);
    return ok(res, user);
  },
};
