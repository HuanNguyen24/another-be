import { Router } from 'express';
import { decodeJWT, queryUser } from '#middlewares/authorization_middleware.js';
import { updateOrder, createOrder, getOrderByTableId, getAllOrders, calculateRevenueDates, getValuesCategory} from '#controllers/order_controller.js';

const router = Router();

router.use(decodeJWT);
router.post('/', queryUser, createOrder);
router.put('/:id', queryUser, updateOrder);
router.get('/', getOrderByTableId);
router.get('/all', getAllOrders);

router.get('/revenueManyDates', calculateRevenueDates)
router.get('/categoryValues', getValuesCategory)

export default router;