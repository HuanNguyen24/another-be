import 'dotenv/config';

const JWTconfig = Object.freeze({
    SECRET: process.env.JWT_SECRET_KEY,
    SECRET_REFRESH: process.env.JWT_SECRET_KEY_REFRESH,
    tokenLife: 1000 * 60 * 60 * 16,
    refreshTokenLife: 1000 * 60 * 60 * 24 * 7,
    algorithm: 'HS256'
});

export default JWTconfig;