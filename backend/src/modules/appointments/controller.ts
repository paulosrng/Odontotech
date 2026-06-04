import { Request, Response } from 'express';
import { created, ok, paginated } from '../../shared/response';
import { getPagination } from '../../shared/pagination';
import { appointmentService } from './service';
import {
  agendaQuerySchema,
  attachServicesSchema,
  createAppointmentSchema,
  listAppointmentsQuerySchema,
  updateAppointmentSchema,
  updateStatusSchema,
} from './schema';

export const appointmentController = {
  async list(req: Request, res: Response) {
    const q = listAppointmentsQuerySchema.parse(req.query);
    const { page, limit, skip, take } = getPagination(req.query);
    const { data, total } = await appointmentService.list({ ...q, skip, take });
    return paginated(res, data, total, page, limit);
  },

  async agenda(req: Request, res: Response) {
    const q = agendaQuerySchema.parse(req.query);
    const data = await appointmentService.agenda(q);
    return ok(res, data);
  },

  async getById(req: Request, res: Response) {
    const data = await appointmentService.getById(req.params.id);
    return ok(res, data);
  },

  async create(req: Request, res: Response) {
    const input = createAppointmentSchema.parse(req.body);
    const data = await appointmentService.create(input);
    return created(res, data, 'Consulta agendada com sucesso.');
  },

  async update(req: Request, res: Response) {
    const input = updateAppointmentSchema.parse(req.body);
    const data = await appointmentService.update(req.params.id, input);
    return ok(res, data, 'Consulta atualizada.');
  },

  async updateStatus(req: Request, res: Response) {
    const { status } = updateStatusSchema.parse(req.body);
    const data = await appointmentService.updateStatus(req.params.id, status);
    return ok(res, data, 'Status atualizado.');
  },

  async remove(req: Request, res: Response) {
    await appointmentService.remove(req.params.id);
    return ok(res, null, 'Consulta removida.');
  },

  async attachServices(req: Request, res: Response) {
    const parsed = attachServicesSchema.parse(req.body);
    const items = 'services' in parsed ? parsed.services : [parsed];
    const data = await appointmentService.attachServices(req.params.id, items);
    return ok(res, data, 'Serviços vinculados à consulta.');
  },
};
