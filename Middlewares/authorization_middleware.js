import JWTconfig from '#config/jwt_config.js';
import jwt from 'jsonwebtoken';
import { models } from '#models/index.js';

async function decodeJWT(req, res, next) {

    try {
        const auth = req.headers.authorization;
        if (!auth) {
            if (req.body.pwd) {
                return next();
            }
            return res.status(401).json({ 'message': 'Unauthorized access' });
        }
        let decodes = undefined;
        try {
            decodes = jwt.verify(auth.split(' ')[1], JWTconfig.SECRET);
        } catch (error) {
            console.error(req.method, req.url, error);
            return res.status(401).json(error);
        }
        res.locals.user = decodes;
        next();
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json(error);
    }
}

async function queryUser(req, res, next) {
    try {
        const decodes = res.locals.user;
        res.locals.user = await models.User.findOne({ where: { userId: decodes.userId } });
        if (!res.locals.user.active) {
            return res.status(403).json({ 'message': 'Unauthorized user' });
        }
        next();

    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json(error);
    }
}

export {
    decodeJWT,
    queryUser
};