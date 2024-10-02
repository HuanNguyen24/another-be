import { models } from '#models/index.js';

async function getStatus(req, res) {
    try {
        const params = req.params;
        const table = await models.Table.findOne({ where: { tableId: params.id } });
        if (table) {
            return res.status(200).json(table);
        }
        else {
            return res.status(404).json({
                'message': 'Not found table'
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
            order: [
                ['tableId', 'ASC']
            ]
        });
        if (tables) {
            return res.status(200).json(tables);
        }
        else {
            return res.status(204).json({
                'message': 'Empty list of tables'
            });
        }
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json(error);
    }
}

export { getStatus, getAllStatus };