import { models, sequelize } from '#models/index.js';
import { checkInteger } from '#services/check_integer.js';
import { roles, statuses } from '#config/role_config.js';

async function createOrder(req, res) {
    let user = res.locals.user;

    try {
        const { tableId, orderList } = req.body;
        if (!tableId || !orderList) return res.status(400).json({ 'message': 'Missing tableId or orderList field' });
        if (!checkInteger(tableId)) return res.status(400).json({ 'message': 'tableId must be an integer' });

        const result = await sequelize.query(`SELECT createOrder(:tableId, :orderedBy, :foodList)`, {
            replacements: {
                tableId: tableId,
                orderedBy: user.userId,
                foodList: JSON.stringify(orderList)
            },
            type: sequelize.QueryTypes.SELECT,
        });

        //result is either 0 or orderId
        if (result == 0) return res.status(500).json({ 'message': 'Cannot create order' });
        return res.status(200).json(result);

    } catch (error) {
        console.error(req.method, req.url, error);
        res.status(500).json({ 'message': 'Server cannot create order' });
    }
}

async function getOrderByTableId(req, res) {
    try {
        const { tableId } = req.query;
        if (!tableId) return res.status(400).json({ 'message': 'Missing tableId' });
        if (!checkInteger(tableId)) return res.status(400).json({ 'message': 'tableId must be an integer' });

        //order_extract: one order
        //orderId
        //statusCode
        //orderTime
        const order_extract = await sequelize.query(`SELECT * FROM getOrder(:tableId)`, {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                tableId: tableId
            }
        });
        //foodList_extract: array of food
        //foodId
        //NAME
        //quantity
        //price
        const foodList_extract = await sequelize.query(`SELECT * FROM getOrderFood(:orderId)`, {
            type: sequelize.QueryTypes.SELECT,
            replacements: {
                orderId: order_extract[0].orderid
            }
        });
        res.status(200).json({
            'orderId': order_extract[0].orderid,
            'statusCode': order_extract[0].statuscode,
            'ordertime': order_extract[0].ordertime,
            'total': calculateTotal(foodList_extract),
            'orderList': foodList_extract
        });
    } catch (error) {
        console.error(req.method, req.url, error);
        res.status(500).json({ 'message': 'Server cannot get order' });
    }
}

async function getAllOrders(req, res) {
    try {
        const { statusCode, limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const orderList = await sequelize.query('SELECT * FROM getOrderPagination(:lm,:os,:sc)', {
            replacements: {
                lm: limit,
                os: offset,
                sc: statusCode
            },
            type: sequelize.QueryTypes.SELECT
        });
        orderList?.forEach(async (order) => {
            order.orderFood = await sequelize.query('SELECT * FROM getOrderFood(:id)', {
                replacements: {
                    id: order.orderid
                },
                type: sequelize.QueryTypes.SELECT
            });

        });
        const total = (await sequelize.query('SELECT COUNT(*) as count FROM "Order" WHERE "statusCode" = :sc', {
            replacements: {
                sc: statusCode,
            },
            type: sequelize.QueryTypes.SELECT
        }))[0].count;
        return res.status(200).json({
            orderList: orderList,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalItems: parseInt(total),
        });

    } catch (error) {
        console.error(req.method, req.url, error);
        res.status(500).json({ 'message': 'Server cannot get order' });
    }
}

async function updateOrder(req, res) {
    try {
        const { body, params } = req;
        const user = res.locals.user;
        const adminOp = (user.roleCode == roles.ADMIN) && (body.statusCode == statuses.FINISHED);
        const staffOp = (user.roleCode == roles.STAFF) && (body.statusCode == statuses.CONFIRMED);
        if (!adminOp || !staffOp) {
            return res.status(405).json({
                'message': 'Access denied'
            });
        }
        const order = await models.Order.findOne({
            where: {
                orderId: params.id
            }
        });
        if (!order) {
            res.status(404).json({
                'message': 'Invalid order id'
            });
        }
        //updated status must be greater than current status by 1
        if ((body.statusCode - order.statusCode) != 1) {
            res.status(400).json({
                'message': 'Invalid status code'
            });
        }
        let valueUpdate = {};
        if (body.statusCodl == statuses.CONFIRMED) {
            valueUpdate = {
                statusCode: body.statusCode,
                finishedBy: user.userId,
                finishTime: Date()
            };
        }
        else {
            valueUpdate = {
                statusCode: body.statusCode,
                payTime: Date()
            };
            await models.Table.update({ status: true }, { where: { tableId: order.tableId } });
        }

        await models.Order.update(valueUpdate, { where: { orderId: params.id } });

        res.status(201).json({
            'message': 'Successful',
            tableId: order.tableId
        });
    } catch (error) {
        console.error(req.method, req.url, error);
        res.status(500).json(error);
    }
}

function calculateTotal(foodList) {
    let total = 0;
    for (let i = 0; i < foodList.length; i++) {
        total += foodList[i].price * foodList[i].quantity;
    }
    return total;
}

export {
    updateOrder,
    createOrder,
    getOrderByTableId,
    getAllOrders,
};