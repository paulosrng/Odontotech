import { Request, Response } from 'express';
import { created, ok, paginated } from '../../shared/response';
import { getPagination } from '../../shared/pagination';
import { patientService } from './service';
import { createPatientSchema, listPatientsQuerySchema, updatePatientSchema } from './schema';

export const patientController = {
  async list(req: Request, res: Response) {
    const q = listPatientsQuerySchema.parse(req.query);
    const { page, limit, skip, take } = getPagination(req.query);
    const { data, total } = await patientService.list({
      search: q.search ?? q.q,
      status: q.status,
      planId: q.planId,
      sort: q.sort,
      dir: q.dir,
      skip,
      take,
    });
    return paginated(res, data, total, page, limit);
  },

  async getById(req: Request, res: Response) {
    const data = await patientService.getById(req.params.id);
    return ok(res, data);
  },

  async create(req: Request, res: Response) {
    const input = createPatientSchema.parse(req.body);
    const data = await patientService.create(input);
    return created(res, data, 'Paciente cadastrado com sucesso.');
  },

  async update(req: Request, res: Response) {
    const input = updatePatientSchema.parse(req.body);
    const data = await patientService.update(req.params.id, input);
    return ok(res, data, 'Paciente atualizado.');
  },

  async remove(req: Request, res: Response) {
    await patientService.remove(req.params.id);
    return ok(res, null, 'Paciente excluído.');
  },
};
