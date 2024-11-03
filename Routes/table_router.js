import { Router } from 'express';
import { decodeJWT } from '#middlewares/authorization_middleware.js';
import {
    getStatus,
    getAllStatus,
    addTable,
    removeTable,
    updateTable,
} from '#controllers/table_controller.js';

const router = Router();

router.use(decodeJWT);

router.get('/', getAllStatus);
router.post('/add', addTable);
router.post('/remove_table', removeTable);
router.put('/update/:tableId', updateTable);

router.get('/:id', getStatus);

export default router;
