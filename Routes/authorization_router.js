import { Router } from 'express';
import {
    addNewUser,
    editUser,
    getInformationStaff,
    login,
    logout,
    refreshToken,
} from '#controllers/authorization_controller.js';
import { decodeJWT } from '#middlewares/authorization_middleware.js';

const router = Router();

router.post('/register', addNewUser);
router.post('/logout', logout);
router.post('/access-token', decodeJWT, refreshToken);

router.use(decodeJWT);

router.post('/login', login);
router.put('/user/editUser', editUser);
router.get('/user-staffs-admin', getInformationStaff);

export default router;
