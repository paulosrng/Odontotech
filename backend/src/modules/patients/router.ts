import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { patientController } from './controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(patientController.list));
router.post('/', asyncHandler(patientController.create));
router.get('/:id', asyncHandler(patientController.getById));
router.put('/:id', asyncHandler(patientController.update));
router.delete('/:id', asyncHandler(patientController.remove));

export default router;
