import { models, sequelize } from '#models/index.js';
import { checkInteger } from '#services/check_integer.js';
import { roles, statuses } from '#config/role_config.js';
import { col, fn, literal, Op } from 'sequelize';

async function createOrder(req, res) {
    let user = req.user;
    const t = await sequelize.transaction();
    try {
        const { tableId, orderList } = req.body;
        if (!tableId || !orderList) return res.status(400).json({ 'message': 'Missing tableId or orderList field' });
        if (!checkInteger(tableId)) return res.status(400).json({ 'message': 'tableId must be an integer' });

        /**
         *      foodid   INTEGER,
                quantity INTEGER,
                remain   INTEGER,
                price    REAL
         */
        const foodDetail = await sequelize.query('SELECT * from getFoodDetail(:foodList)', {
            replacements: {
                foodList: JSON.stringify(orderList)
            },
            type: sequelize.QueryTypes.SELECT
        });

        //validate input
        if (foodDetail.length == 0) return res.status(400).json({ 'message': 'Null food' });

        if (foodDetail.find((row) => (row.quantity > row.remain))) return res.status(400).json({ 'message': 'No enough food for ' + row.foodid });

        //create new order and get id of this
        const orderId = (await models.Order.create(
            {
                tableId: tableId,
                orderedBy: user.userId,
                statusCode: 0
            },
            {
                transaction: t
            }
        )).orderId;

        await Promise.all([...foodDetail.flatMap((row) => (
            [
                models.Food.update(
                    {
                        quantity: row.remain - row.quantity
                    },
                    {
                        where: {
                            foodId: row.foodid
                        },
                        transaction: t
                    }
                ),
                models.OrderFood.create(
                    {
                        orderId: orderId,
                        foodId: row.foodid,
                        quantity: row.quantity,
                        price: row.price
                    },
                    {
                        transaction: t
                    }
                )
            ]
        )),
        models.Table.update({ status: false }, { where: { tableId: tableId }, transaction: t })
        ]);

        await t.commit();
        return res.status(200).json({ 'message': orderId });

    } catch (error) {
        console.error(req.method, req.url, error);
        await t.rollback();
        return res.status(500).json({ 'message': 'Server cannot create order' });
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
        return res.status(200).json({
            'orderId': order_extract[0].orderid,
            'statusCode': order_extract[0].statuscode,
            'ordertime': order_extract[0].ordertime,
            'total': calculateTotal(foodList_extract),
            'orderList': foodList_extract
        });
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json({ 'message': 'Server cannot get order' });
    }
}

async function getAllOrders(req, res) {
    try {
        const { statusCode = -1, limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;

        const orderList = await sequelize.query('SELECT * FROM getOrderPagination(:lm,:os,:sc)', {
            replacements: {
                lm: limit,
                os: offset,
                sc: statusCode
            },
            type: sequelize.QueryTypes.SELECT
        });

        const orderFood = await Promise.all(orderList?.map((order) => sequelize.query('SELECT * FROM getOrderFood(:id)', {
            replacements: {
                id: order.orderid
            },
            type: sequelize.QueryTypes.SELECT
        })));

        orderList?.forEach(function (order, index) {
            order.orderFood = orderFood[index];
        });

        const total = (await sequelize.query('SELECT COUNT(*) as count FROM "Order" WHERE "statusCode" = :sc OR :sc = -1', {
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
        return res.status(500).json({ 'message': 'Server cannot get order' });
    }
}

async function updateOrder(req, res) {
    try {
        const { body, params } = req;
        const user = req.user;
        const adminOp = (user.roleCode == roles.ADMIN) && (body.statusCode == statuses.FINISHED);
        const staffOp = (user.roleCode == roles.STAFF) && (body.statusCode == statuses.DELIVERED);
        if (!adminOp && !staffOp) {
            return res.status(405).json({
                message: 'Access denied'
            });
        }
        const order = await models.Order.findOne({
            where: {
                orderId: params.id
            }
        });
        if (!order) {
            return res.status(404).json({
                'message': 'Invalid order id'
            });
        }
        //updated status must be greater than current status by 1
        if ((body.statusCode - order.statusCode) != 1) {
            return res.status(400).json({
                'message': 'Invalid status code'
            });
        }
        let valueUpdate = {};
        if (body.statusCode == statuses.FINISHED) {
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

        return res.status(201).json({
            'message': 'Successful',
            tableId: order.tableId
        });
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json(error);
    }
}

function calculateTotal(foodList) {
    let total = 0;
    for (let i = 0; i < foodList.length; i++) {
        total += foodList[i].price * foodList[i].quantity;
    }
    return total;
}

async function calculateRevenueDates(req,res) {
    const {startDate, endDate}  = req.body;
    const startTime = new Date(`${startDate}T00:00:00.000Z`)
    const endTime = new Date(`${endDate}T23:59:59.999Z`)
    try {
        const data = await models.OrderFood.findAll({
            attributes: [
                [fn('DATE_TRUNC', 'day', col('"order"."payTime"')), 'payTime'], // Group Date
                [fn('SUM', literal('"OrderFood"."price" * "OrderFood"."quantity"')), 'totalRevenue'], // Calculate total price
            ],
            include: [
                {
                    model: models.Order, 
                    as: 'order',
                    attributes: [],
                    where: {
                        payTime: {
                            [Op.between]: [startTime,endTime]
                        }
                    }
                },
            ],
            group: [fn('DATE_TRUNC', 'day',col('"order"."payTime"'))], // Group date
            order:[
                [fn('DATE_TRUNC', 'day',col('"order"."payTime"'))]
            ]
        });

        const response = processResponseRevenueDates(startDate, endDate, data)

        res.status(200).json(response)
    } catch(err){
        console.error(err.message); // Log error
        res.status(404).json({ error: "Error" });
    }
}

function processResponseRevenueDates(startDate, endDate, data){
    let startPoint = new Date(startDate)
    let endPoint = new Date(endDate)
    let response = []
    let i = 0
    let flag = false

    while (startPoint <= endPoint){
        const dateCurr = startPoint.toISOString().split('T')[0]
        if (i < data.length){   
            const dataValues = data[i].dataValues
            const dateCheck = dataValues.payTime.toISOString().split('T')[0]
            // check if the date is received revenue
            if ( dateCheck === dateCurr){
                response.push({date: dateCheck, totalRevenue: dataValues.totalRevenue})
                i++
                flag = false
            } else {
                flag = true
            }
        } else {
            flag = true
        }          
        if(flag === true) {
            response.push({
                date: dateCurr,
                totalRevenue: 0
            })
        }
        startPoint.setDate(startPoint.getDate() + 1)
    }
    return response
}

async function getValuesCategory(req,res) {
    try{
        const data = await models.Food.findAll({
            attributes: [
                [col('category.name'),'name'],
                [col('category.categoryId'), "idCategory"],
                [fn('SUM', col("Food.quantity")), "total"]
            ],
            include: {
                model: models.Category,
                as: 'category',
                attributes: []
            },   
            group: ['category.name','category.categoryId'] 
        })
        res.status(200).json(data)
    } catch(err){
        console.error(err.message)
        res.status(404).json({error: "ERROR"})
    }
}

export {
    updateOrder,
    createOrder,
    getOrderByTableId,
    getAllOrders,
    calculateRevenueDates,
    getValuesCategory
};