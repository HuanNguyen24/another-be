import { models } from '#models/index.js';
import { roles } from '#root/config/role_config.js';
import { where } from 'sequelize';

async function getStatus(req, res) {
    try {
        const params = req.params;
        const table = await models.Table.findOne({
            where: { tableId: params.id },
        });
        if (table) {
            return res.status(200).json(table);
        } else {
            return res.status(404).json({
                message: 'Not found table',
            });
        }
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json(error);
    }
}
async function getAllStatus(req, res) {
    try {
        const tables = await models.Table.findAll({
            order: [['tableId', 'ASC']],
        });
        if (tables) {
            return res.status(200).json(tables);
        } else {
            return res.status(204).json({
                message: 'Empty list of tables',
            });
        }
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json(error);
    }
}

async function addTable(req, res) {
    try {
        const extractedUser = req.user;
        if (extractedUser.roleCode !== roles.ADMIN) {
            res.status(405).json({ success: false, message: 'Not allowed!!!' });
        } else {
            const { tableId } = req.body;

            const tableNew = await models.Table.create({
                tableId: tableId,
                status: true,
                active: true,
                numCustomer: 0,
            });
            res.status(200).json({ success: true, table: tableNew });
        }
    } catch (err) {
        res.status(400).json({ success: false, message: 'error' });
    }
}

async function removeTable(req, res) {
    try {
        const extractedUser = req.user;
        if (extractedUser.roleCode !== roles.ADMIN) {
            res.status(405).json({ success: false, message: 'Not allowed!!!' });
        } else {
            const { tableId } = req.body;
            const table = await models.Table.findOne({
                where: {
                    tableId: tableId,
                },
            });
            // if table not exist, return error
            if (!table) {
                res.status(204).json({
                    success: false,
                    message: 'Table is not in database',
                });
                return;
            }
            // if table exist, change state to false
            await table.update({
                active: false,
                status: false,
            });
            res.status(200).json({
                success: true,
                message: 'Table is deleted (disabled)',
            });
        }
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Error from removing table (disabled)',
        });
    }
}

export { getStatus, getAllStatus, addTable, removeTable };

// if table exist, change active to true
// const result = await models.Table.findOne({
//     where: { tableId: tableId },
// });
// if (result) {
//     const tableUpdate = await result.update({
//         active: true,
//     });
//     res.status(200).json({
//         success: true,
//         message: 'Table has been added',
//         table: tableUpdate,
//     });
//     return;
// }
// if table not exist, add new table to database
