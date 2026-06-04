import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { serviceController } from './controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(serviceController.list));
router.post('/', asyncHandler(serviceController.create));
router.put('/:id', asyncHandler(serviceController.update));
router.delete('/:id', asyncHandler(serviceController.remove));

export default router;
