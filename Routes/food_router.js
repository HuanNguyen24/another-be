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

// TODO: POST REQUEST
router.post('/', fileUpload({ limits: { fileSize: 10000000, }, abortOnLimit: true, }), queryUser, createFood);

// TODO: GET REQUEST


// For Demo Only
router.get('/all', getAllFood);

// Main route

// Get only one food
router.get('/:id', getFoodById);


// Filtering food and do pagination
router.get('/', getFood);

// TODO: DELETE REQUEST
router.delete('/:id', queryUser, deleteFood);

// TODO: PUT REQUEST
router.put('/:id', fileUpload({ limits: { fileSize: 10000000, }, abortOnLimit: true, }), queryUser, updateFood);
export default router;