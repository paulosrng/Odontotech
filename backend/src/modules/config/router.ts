import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { configController } from './controller';

const router = Router();

// All config routes require authentication.
router.use(authenticate);

// Clinic / system settings
router.get('/', asyncHandler(configController.getSettings));
router.put('/', authorize('ADMIN'), asyncHandler(configController.updateSettings));

// Dentists (read-only convenience list for dropdowns) — any authenticated user
router.get('/dentists', asyncHandler(configController.listDentists));

// User management — ADMIN only
router.get('/users', authorize('ADMIN'), asyncHandler(configController.listUsers));
router.post('/users', authorize('ADMIN'), asyncHandler(configController.createUser));
router.put('/users/:id', authorize('ADMIN'), asyncHandler(configController.updateUser));
router.delete('/users/:id', authorize('ADMIN'), asyncHandler(configController.removeUser));

export default router;
