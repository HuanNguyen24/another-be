import { Router } from 'express';
import { createCategory, getAllCategory, deleteCategory } from '#controllers/category_controller.js';
import { decodeJWT } from '#middlewares/authorization_middleware.js';


const router = Router();

router.use(decodeJWT);

router.get('/', getAllCategory);
router.post('/', createCategory);
router.delete('/item', deleteCategory);

export default router;