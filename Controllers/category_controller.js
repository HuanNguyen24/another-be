import { models } from '#models/index.js';

async function createCategory(req, res) {
    const { name } = req.body;
    try {
        const newCate = await models.Category.create({
            name: name,
        });
        res.status(200).json(newCate);
    } catch (error) {
        console.error(req.method, req.url, error);
        res.status(500).json({ 'message': 'Server cannot create category' });
    }
}

async function getAllCategory(req, res) {
    try {
        const cate = await models.Category.findAll();
        res.status(200).json(cate);
    } catch (error) {
        console.error(req.method, req.url, error);
        res.status(500).json({ 'message': `Server cannot fetch categories` });
    }
}

export {
    getAllCategory,
    createCategory
};