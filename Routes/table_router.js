import { Router } from 'express';
import { decodeJWT } from '#middlewares/authorization_middleware.js';
import {
    getStatus,
    getAllStatus,
    addTable,
    removeTable,
} from '#controllers/table_controller.js';

const router = Router();

router.use(decodeJWT);
router.get('/:id', getStatus);
router.get('/', getAllStatus);
router.post('/add', addTable);
router.post('/remove_table', removeTable);

export default router;
