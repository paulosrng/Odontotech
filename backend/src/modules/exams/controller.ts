import { Request, Response } from 'express';
import { created, ok, paginated } from '../../shared/response';
import { getPagination } from '../../shared/pagination';
import { examService, type UploadedFile } from './service';
import { createExamSchema, listExamsQuerySchema, updateExamSchema } from './schema';

function getFiles(req: Request): UploadedFile[] {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  return files.map((f) => ({
    filename: f.filename,
    originalname: f.originalname,
    path: f.path,
    mimetype: f.mimetype,
    size: f.size,
  }));
}

export const examController = {
  // GET /patients/:id/exams
  async listByPatient(req: Request, res: Response) {
    const q = listExamsQuerySchema.parse(req.query);
    const { page, limit, skip, take } = getPagination(req.query);
    const patientId = req.params.id ?? req.params.patientId;
    const { data, total } = await examService.listByPatient(patientId, { skip, take, status: q.status });
    return paginated(res, data, total, page, limit);
  },

  // GET /exams  (global list, used by the Exams screen)
  async listAll(req: Request, res: Response) {
    const q = listExamsQuerySchema.parse(req.query);
    const { page, limit, skip, take } = getPagination(req.query);
    const { data, total } = await examService.listAll({
      search: q.search ?? q.q,
      status: q.status,
      patientId: q.patientId,
      skip,
      take,
    });
    return paginated(res, data, total, page, limit);
  },

  // POST /patients/:id/exams  (multipart/form-data with file upload)
  async create(req: Request, res: Response) {
    const patientId = req.params.id ?? req.params.patientId;
    const input = createExamSchema.parse(req.body);
    const data = await examService.create(patientId, input, getFiles(req));
    return created(res, data, 'Exame cadastrado.');
  },

  // PUT /exams/:id
  async update(req: Request, res: Response) {
    const input = updateExamSchema.parse(req.body);
    const data = await examService.update(req.params.id, input, getFiles(req));
    return ok(res, data, 'Exame atualizado.');
  },

  // DELETE /exams/:id
  async remove(req: Request, res: Response) {
    await examService.remove(req.params.id);
    return ok(res, null, 'Exame removido.');
  },
};
