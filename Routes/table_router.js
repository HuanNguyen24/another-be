import { Router } from 'express';
import { decodeJWT } from '#middlewares/authorization_middleware.js';
import { getStatus, getAllStatus } from '#controllers/table_controller.js';

const router = Router();

router.use(decodeJWT);
router.get('/:id', getStatus);
router.get('/', getAllStatus);

export default router;