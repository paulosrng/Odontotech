import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { examController } from './controller';

// Routes nested under /patients/:id/exams (mergeParams to read :id).
export const patientExamsRouter = Router({ mergeParams: true });
patientExamsRouter.use(authenticate);
patientExamsRouter.get('/', asyncHandler(examController.listByPatient));
patientExamsRouter.post('/', upload.array('files', 10), asyncHandler(examController.create));

// Routes under /exams.
export const examsRouter = Router();
examsRouter.use(authenticate);
examsRouter.get('/', asyncHandler(examController.listAll));
examsRouter.put('/:id', upload.array('files', 10), asyncHandler(examController.update));
examsRouter.delete('/:id', asyncHandler(examController.remove));

export default examsRouter;
