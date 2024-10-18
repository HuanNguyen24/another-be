import { models } from '#models/index.js';

async function createCategory(req, res) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ 'message': 'Missing category name' });
    try {
        const newCate = await models.Category.create({
            name: name,
        });
        return res.status(200).json(newCate);
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json({ 'message': 'Server cannot create category' });
    }
}

async function getAllCategory(req, res) {
    try {
        const cate = await models.Category.findAll();
        return res.status(200).json(cate);
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json({ 'message': `Server cannot fetch categories` });
    }
}

//delete category : SƠN
async function deleteCategory(req, res) {
    try {
        const { categoryId } = req.body;
        await models.Category.destroy({ where: { categoryId } });
        res.status(200).json({});
    } catch (error) {
        console.error(req.method, req.url, error);
        res.status(500).json({ error });
    }
}

export {
    getAllCategory,
    createCategory,
    deleteCategory
};