import { Router } from 'express';
import { decodeJWT, queryUser } from '#middlewares/authorization_middleware.js';
import { updateOrder, createOrder, getOrderByTableId, getAllOrders, calculateRevenueDates, getValuesCategory, calculateRevenueByMonth, calculateRevenueByYear, storageSummary} from '#controllers/order_controller.js';

const router = Router();

router.use(decodeJWT);
router.post('/', queryUser, createOrder);
router.put('/:id', queryUser, updateOrder);
router.get('/', getOrderByTableId);
router.get('/all', getAllOrders);

router.get('/revenue/revenueManyDates', calculateRevenueDates);
router.get('/revenue/categoryValues', getValuesCategory);
router.get('/revenueByMonth',calculateRevenueByMonth);
router.get('/revenueByYear',calculateRevenueByYear);
router.get('/storageSummary', storageSummary);
export default router;