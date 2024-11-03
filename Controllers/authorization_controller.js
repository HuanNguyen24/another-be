import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { models } from '#models/index.js';
import 'dotenv/config';
import JWTconfig from '#config/jwt_config.js';
import { roles } from '#root/config/role_config.js';

async function login(req, res) {
    try {
        let extractedUser = req.user;
        // If not provided with access token, check username and password
        if (!extractedUser) {
            const { userName, pwd } = req.body;
            if (!userName || !pwd) {
                return res
                    .status(400)
                    .json({ message: 'No username and/or password' });
            }
            extractedUser = await models.User.findOne({
                where: { userName: userName },
            });
            if (!extractedUser) {
                return res
                    .status(404)
                    .json({ message: 'Incorrect username or password' });
            }
            const result = await bcrypt.compare(pwd, extractedUser.pwd);
            if (!result) {
                return res
                    .status(404)
                    .json({ message: 'Incorrect username or password' });
            }
        } else
            extractedUser = await models.User.findOne({
                where: { userName: extractedUser.userName },
            });

        const accessToken = generateAccessToken({
            userId: extractedUser.userId,
            roleCode: extractedUser.roleCode,
        });
        const refreshToken = generateRefreshToken({
            userId: extractedUser.userId,
            roleCode: extractedUser.roleCode,
        });

        return res.status(200).json({
            userId: extractedUser.userId,
            userName: extractedUser.userName,
            name: extractedUser.name,
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json({ message: 'Server cannot login' });
    }
}

async function logout(req, res) {
    try {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json(error);
    }
}

async function refreshToken(req, res) {
    try {
        const extractedUser = req.user;
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res.status(404).json({
                message: 'Not found refresh token in body !',
            });
        }
        const decodes = jwt.verify(refreshToken, JWTconfig.SECRET_REFRESH);
        const newToken = jwt.sign(
            {
                userId: extractedUser.userId,
                roleCode: extractedUser.roleCode,
            },
            JWTconfig.SECRET,
            {
                algorithm: JWTconfig.algorithm,
                expiresIn: JWTconfig.tokenLife,
            }
        );

        res.cookie('accessToken', newToken, {
            httpOnly: true,
            maxAge: JWTconfig.tokenLife,
        });
        return res.status(200).json({
            message: 'successful',
            accessToken: newToken,
        });
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(401).json(error);
    }
}

async function addNewUser(req, res) {
    try {
        const body = req.body;
        const hashCode = await bcrypt.hash(body.pwd, 10);
        const newUser = await models.User.create({
            userName: body.userName,
            name: body.name,
            pwd: hashCode,
            roleCode: 0,
        });
        return res.status(200).json({
            userId: newUser.userId,
            userName: newUser.userName,
            name: newUser.name,
            roleCode: newUser.roleCode,
        });
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json(error);
    }
}

function generateAccessToken(payload) {
    return jwt.sign(payload, JWTconfig.SECRET, {
        algorithm: JWTconfig.algorithm,
        expiresIn: JWTconfig.tokenLife,
    });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, JWTconfig.SECRET_REFRESH, {
        algorithm: JWTconfig.algorithm,
        expiresIn: JWTconfig.refreshTokenLife,
    });
}

async function editUser(req, res) {
    try {
        const userId = req.user.userId;
        const user = await models.User.findOne({ where: { userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Define restricted fields that should not be updated
        const restrictedFields = [
            'userId',
            'userName',
            'pwd',
            'active',
            'roleCode',
            'createdAt',
        ];

        // Create a dynamic update object with non-null attributes
        const updatedFields = {};
        Object.keys(req.body).forEach((key) => {
            if (
                req.body[key] !== null &&
                req.body[key] !== undefined &&
                !restrictedFields.includes(key)
            ) {
                updatedFields[key] = req.body[key];
            }
        });

        // If there are fields to update, proceed
        if (Object.keys(updatedFields).length > 0) {
            await models.User.update(updatedFields, { where: { userId } });
            return res
                .status(200)
                .json({ message: 'User updated successfully' });
        } else {
            return res
                .status(400)
                .json({ message: 'No valid fields to update' });
        }
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json(error);
    }
}

async function getInformationStaff(req, res) {
    try {
        const userData = await models.User.findAll({
            attributes: [
                'userId',
                'userName',
                'userName',
                'name',
                'phoneNumber',
                'email',
                'createdTime',
                'createdTime',
                'roleCode',
                'active',
            ],
        });
        const admin = [];
        const user = [];
        userData.map((item) => {
            const dataItem = item.dataValues;
            if (dataItem.active === true) {
                const data = { ...dataItem };
                if (dataItem.roleCode === roles.ADMIN) {
                    admin.push(data);
                } else {
                    user.push(data);
                }
            }
        });
        const data = {
            admin: admin.find((u) => u.userId == req.user.userId),
            admin: admin.find((u) => u.userId == req.user.userId),
            user: user,
        };
        res.status(200).json({ success: true, data });
    } catch (err) {
        console.log('Error');
        res.status(401).json({ success: false });
    }
}

export {
    addNewUser,
    login,
    logout,
    refreshToken,
    editUser,
    getInformationStaff,
};
