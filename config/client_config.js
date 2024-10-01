import dbConfig from '#config/dbConfig.js';

const clientConfig = {
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
    port: 5432,
};

export default clientConfig;