import { Request, Response } from 'express';
import { created, ok } from '../../shared/response';
import { configService } from './service';
import {
  createUserSchema,
  listUsersQuerySchema,
  updateSettingsSchema,
  updateUserSchema,
} from './schema';

export const configController = {
  // GET /config
  async getSettings(_req: Request, res: Response) {
    const data = await configService.getSettings();
    return ok(res, data);
  },

  // PUT /config (ADMIN)
  async updateSettings(req: Request, res: Response) {
    const input = updateSettingsSchema.parse(req.body);
    const data = await configService.updateSettings({ ...input });
    return ok(res, data, 'Configurações atualizadas.');
  },

  // GET /config/dentists
  async listDentists(req: Request, res: Response) {
    const data = await configService.listDentists(req.user!.clinicId);
    return ok(res, data);
  },

  // GET /config/users (ADMIN)
  async listUsers(req: Request, res: Response) {
    const q = listUsersQuerySchema.parse(req.query);
    const data = await configService.listUsers(q, req.user!.clinicId);
    return ok(res, data);
  },

  // POST /config/users (ADMIN)
  async createUser(req: Request, res: Response) {
    const input = createUserSchema.parse(req.body);
    const data = await configService.createUser(req.user!.clinicId, input);
    return created(res, data, 'Usuário criado.');
  },

  // PUT /config/users/:id (ADMIN)
  async updateUser(req: Request, res: Response) {
    const input = updateUserSchema.parse(req.body);
    const data = await configService.updateUser(req.params.id, input);
    return ok(res, data, 'Usuário atualizado.');
  },

  // DELETE /config/users/:id (ADMIN)
  async removeUser(req: Request, res: Response) {
    await configService.removeUser(req.params.id, req.user!.id);
    return ok(res, null, 'Usuário removido.');
  },
};
