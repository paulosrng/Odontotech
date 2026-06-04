import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { authenticate } from '../../middlewares/auth.middleware';
import { appointmentController } from './controller';

const router = Router();

router.use(authenticate);

// NOTE: /agenda must come before /:id so it isn't captured as an id.
router.get('/agenda', asyncHandler(appointmentController.agenda));

router.get('/', asyncHandler(appointmentController.list));
router.post('/', asyncHandler(appointmentController.create));
router.get('/:id', asyncHandler(appointmentController.getById));
router.put('/:id', asyncHandler(appointmentController.update));
router.delete('/:id', asyncHandler(appointmentController.remove));

// Status transition (confirm / complete / cancel)
router.patch('/:id/status', asyncHandler(appointmentController.updateStatus));

// Attach services to an appointment ("Associar à consulta")
router.post('/:id/services', asyncHandler(appointmentController.attachServices));

export default router;
