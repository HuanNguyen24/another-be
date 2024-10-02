import { Router } from 'express';
import {
    createFood,
    getAllFood,
    getFood,
    getFoodById,
    deleteFood,
    getFoodImageById,
    updateFood
} from '#controllers/food_controller.js';
import { decodeJWT, queryUser } from '#middlewares/authorization_middleware.js';
import fileUpload from 'express-fileupload';

const router = Router();

router.get('/img/:id', getFoodImageById);

router.use(decodeJWT);

// For Demo Only
router.get('/all', getAllFood);

router.post('/', fileUpload({ limits: { fileSize: 10000000, }, abortOnLimit: true, }), queryUser, createFood);
router.get('/:id', getFoodById);
router.get('/', getFood);
router.delete('/:id', queryUser, deleteFood);
router.put('/:id', fileUpload({ limits: { fileSize: 10000000, }, abortOnLimit: true, }), queryUser, updateFood);

export default router;