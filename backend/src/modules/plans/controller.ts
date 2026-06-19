import { Request, Response } from 'express';
import { created, ok, paginated } from '../../shared/response';
import { getPagination } from '../../shared/pagination';
import { planService } from './service';
import { createPlanSchema, listPlansQuerySchema, updatePlanSchema } from './schema';

export const planController = {
  async list(req: Request, res: Response) {
    const q = listPlansQuerySchema.parse(req.query);
    const { page, limit, skip, take } = getPagination(req.query);
    const { data, total } = await planService.list({ clinicId: req.user!.clinicId, status: q.status, skip, take });
    return paginated(res, data, total, page, limit);
  },

  async create(req: Request, res: Response) {
    const input = createPlanSchema.parse(req.body);
    const data = await planService.create(req.user!.clinicId, input);
    return created(res, data, 'Plano cadastrado.');
  },

  async update(req: Request, res: Response) {
    const input = updatePlanSchema.parse(req.body);
    const data = await planService.update(req.params.id, input);
    return ok(res, data, 'Plano atualizado.');
  },

  async remove(req: Request, res: Response) {
    await planService.remove(req.params.id);
    return ok(res, null, 'Plano removido.');
  },
};
