//==================== import lib===========================
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';
import path from 'path';
import cookieParser from 'cookie-parser';

//==================== import router==========================
import authorizationRouter from '#routes/authorization_router.js';
import foodRouter from '#routes/food_router.js';
import orderRouter from '#routes/order_router.js';
import tableRouter from '#routes/table_router.js';
import cateRouter from '#routes/category_router.js';

//===================config app===============================
const app = express();

app.get('/', async function (req, res) {
    res.status(200).send('Welcome');
});

app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
app.use(bodyParser.text({ limit: '200mb' }));
app.use(cookieParser());
app.use(cors());


app.use('/api/authorization', authorizationRouter);
app.use('/api/food', foodRouter);
app.use('/api/orders', orderRouter);
app.use('/api/tables', tableRouter);
app.use('/api/categories', cateRouter);

global.__dirname = process.cwd();

app.listen(process.env.PORT, () => {
    console.log('Running at %d and _dirname is ', process.env.PORT, __dirname);
});