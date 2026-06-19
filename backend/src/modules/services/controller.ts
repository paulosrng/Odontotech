import { Request, Response } from 'express';
import { created, ok, paginated } from '../../shared/response';
import { getPagination } from '../../shared/pagination';
import { serviceService } from './service';
import { createServiceSchema, listServicesQuerySchema, updateServiceSchema } from './schema';

export const serviceController = {
  async list(req: Request, res: Response) {
    const q = listServicesQuerySchema.parse(req.query);
    const { page, limit, skip, take } = getPagination(req.query);
    const { data, total } = await serviceService.list({
      clinicId: req.user!.clinicId,
      search: q.search ?? q.q,
      category: q.category ?? q.cat,
      skip,
      take,
    });
    return paginated(res, data, total, page, limit);
  },

  async create(req: Request, res: Response) {
    const input = createServiceSchema.parse(req.body);
    const data = await serviceService.create(req.user!.clinicId, input);
    return created(res, data, 'Serviço cadastrado.');
  },

  async update(req: Request, res: Response) {
    const input = updateServiceSchema.parse(req.body);
    const data = await serviceService.update(req.params.id, input);
    return ok(res, data, 'Serviço atualizado.');
  },

  async remove(req: Request, res: Response) {
    await serviceService.remove(req.params.id);
    return ok(res, null, 'Serviço removido.');
  },
};
