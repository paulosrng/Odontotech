import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { planController } from './controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(planController.list));
router.post('/', asyncHandler(planController.create));
router.put('/:id', asyncHandler(planController.update));
router.delete('/:id', asyncHandler(planController.remove));

export default router;
