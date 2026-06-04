import { Request, Response } from 'express';
import { ok } from '../../shared/response';
import { dentalRecordService } from './service';
import { updateDentalRecordSchema } from './schema';

export const dentalRecordController = {
  // GET /patients/:id/dental-record
  async get(req: Request, res: Response) {
    const patientId = req.params.id ?? req.params.patientId;
    const data = await dentalRecordService.get(patientId);
    return ok(res, data);
  },

  // PUT /patients/:id/dental-record
  async update(req: Request, res: Response) {
    const patientId = req.params.id ?? req.params.patientId;
    const { notes } = updateDentalRecordSchema.parse(req.body);
    const data = await dentalRecordService.update(patientId, notes ?? '');
    return ok(res, data, 'Prontuário atualizado.');
  },
};
