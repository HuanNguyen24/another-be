import { Op } from 'sequelize';
import { models } from '#models/index.js';
import { roles } from '#config/role_config.js';
import { checkInteger } from '#services/check_integer.js';
import fs from 'fs';

// const __dirname = ""
async function createFood(req, res) {

    // Authorize the user (Only admin can createFood)
    let user = req.user;

    if (user.roleCode != roles.ADMIN) return res.status(403).json({ 'message': 'Unauthorized operation' });

    const { categoryId, name, quantity, price } = req.body;
    const { image } = req.files;

    try {
        if (!image) return res.status(400).json({ 'message': 'You need to upload image' });
        // If doesn't have image mime type prevent from uploading
        if (!/^image/.test(image.mimetype)) return res.status(400).json({ 'message': 'The file does not have image mime type' });

        // Creating a new food
        const newFood = await models.Food.create({
            categoryId: categoryId,
            name: name,
            quantity: quantity,
            price: price,
            active: true
        });

        newFood["imgURL"] = `/food/img/${newFood.foodId}`;
        await newFood.save();
        // Move the uploaded image to our upload folder
        image.mv(__dirname + '/upload/' + newFood.foodId + ".png");
        return res.status(200).json(newFood);
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json({ 'message': 'Server cannot create food' });
    }
}

async function deleteFood(req, res) {
    try {
        let user = req.user;

        if (user.roleCode != roles.ADMIN) return res.status(403).json({ 'message': 'Unauthorized operation' });
        const { id } = req.params;
        if (!id) return res.status(400).json({ 'message': 'Missing foodId field' });
        if (!checkInteger(id)) return res.status(400).json({ 'message': 'foodId must be an integer' });

        const food = await models.Food.findOne({
            where: {
                foodId: id
            }
        });
        if (!food) return res.status(204).json({ 'message': 'Food is not in database' });

        await food.update({
            active: false
        });
        return res.status(200).json({
            'message': 'Food is deleted (disabled)'
        });
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json({ 'message': 'Server cannot delete food' });
    }
}

async function getAllFood(req, res) {
    try {
        const foods = await models.Food.findAll({
            include: {
                model: models.Category,
                as: 'category',
            }
        });
        return res.status(200).json(foods);
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json({ message: `Server cannot fetch foods: ${err}` });
    }
}

async function getFood(req, res) {
    const { categoryId, minPrice, maxPrice, minQuantity, maxQuantity, page = 1, limit = 10 } = req.query;

    try {
        const where = {};
        const offset = (page - 1) * limit;


        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) {
                where.price[Op.gte] = minPrice;
            }
            if (maxPrice) {
                where.price[Op.lte] = maxPrice;
            }
        }

        if (minQuantity || maxQuantity) {
            where.quantity = {};
            if (minQuantity) {
                where.quantity[Op.gte] = minQuantity;
            }
            if (maxQuantity) {
                where.quantity[Op.lte] = maxQuantity;
            }
        }
        const { count, rows } = await models.Food.findAndCountAll({
            include: {
                model: models.Category,
                as: 'category',
            },
            where,
            offset,
            limit: parseInt(limit),
        });
        const totalPages = Math.ceil(count / limit);
        return res.status(200).json({
            foods: rows,
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
        });
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json({ message: `Server cannot fetch foods: ${err}` });
    }
}

async function getFoodById(req, res) {
    const id = req.params.id;
    try {
        const extractedFood = await models.Food.findOne({ where: { foodId: id } });
        return res.status(200).json(extractedFood);
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json({ 'message': 'Server cannot get food by id' });
    }
}

async function getFoodImageById(req, res) {
    const id = req.params.id;
    try {
        const extractedFood = await models.Food.findOne({ where: { foodId: id } });
        if (extractedFood) {
            // const imagePath = path.join(__dirname, '/upload', `${id}.png`);
            res.setHeader('Content-Type', 'image/png');
            const imageData = fs.readFileSync(`${__dirname}/upload/${id}.png`);
            res.setHeader('Content-Type', 'image/png');
            return res.status(200).sendFile(`${__dirname}/upload/${id}.png`);
        }
    } catch (err) {
        console.error(req.method, req.url, err);
        return res.status(500).json({ 'message': 'Server cannot get food by id' });
    }
}

async function updateFood(req, res) {
    try {
        const { body, files, params } = req;
        let user = req.user;

        if (user.roleCode != roles.ADMIN) return res.status(403).json({ 'message': 'Unauthorized operation' });

        const food = await models.Food.findOne({ where: { foodId: params.id } });
        if (!food) {
            return res.status(404).json({
                message: "Not found food"
            });
        }
        if (body.quantity) if (body.quantity < 0) return res.status(400).json({ message: 'quantity cannot be negative' });
        if (body.price) if (body.price < 0) return res.status(400).json({ message: 'price cannot be negative' });
        await models.Food.update(body, { where: { foodId: params.id } });
        food.imgURL = `/food/img/${food.foodId}`;
        if (files) files.image.mv(__dirname + '/upload/' + food.foodId + ".png");

        return res.status(200).json({ message: 'Update successfully' });
    } catch (error) {
        console.error(req.method, req.url, error);
        return res.status(500).json(error);
    }
}

export {
    getAllFood,
    getFood,
    getFoodById,
    createFood,
    deleteFood,
    getFoodImageById,
    updateFood,
};