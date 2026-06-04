import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { dentalRecordController } from './controller';

// Mounted at /patients/:id/dental-record (mergeParams to read :id).
const router = Router({ mergeParams: true });

router.use(authenticate);
router.get('/', asyncHandler(dentalRecordController.get));
router.put('/', asyncHandler(dentalRecordController.update));

export default router;
