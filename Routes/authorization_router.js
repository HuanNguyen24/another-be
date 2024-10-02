import { Router } from 'express';
import {
    addNewUser,
    login,
    logout,
    refreshToken
} from '#controllers/authorization_controller.js';
import { decodeJWT } from '#middlewares/authorization_middleware.js';

const router = Router();

router.post('/register', addNewUser);
router.post('/logout', logout);
router.post('/login', login);
router.post('/access-token',decodeJWT, refreshToken);

router.use(decodeJWT);



export default router;