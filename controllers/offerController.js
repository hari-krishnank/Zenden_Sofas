const Offer = require('../models/offerModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')

const moment = require('moment')

const loadOffers = async (req, res) => {
    try {
        const Offers = await Offer.find().populate({
            path: 'items.itemId',
            populate: {
                path: 'itemId',
                model: 'category'
            }
        }).populate({
            path: 'items.itemId',
            populate: {
                path: 'itemId',
                model: 'Product'
            }
        });

        console.log('Offers.....:', Offers)
        res.render('admin/offers', { Offers, moment })
    } catch (error) {
        console.log(error.message);
    }
}


const loadAddOffers = async (req, res) => {
    try {
        const categories = await Category.find({ is_listed: 1 });
        console.log('categories....:', categories);

        const products = await Product.find({ is_listed: 1 })
        console.log('products......:', products);

        res.render('admin/addOffers', { categories, products })
    } catch (error) {
        console.log(error.message);
    }
}

const addOffers = async (req, res) => {
    try {
        const { name, description, category, product, percentage, startingDate, expiryDate } = req.body;
        console.log('addOffers......:', req.body);

        if (!category && !product) {
            const categories = await Category.find({ is_listed: 1 });
            const products = await Product.find({ is_listed: 1 });
            return res.render('admin/addOffers', { categories, products, errorMessage: "Either category or product must be selected." });
        }

        const items = [];
        let categoryName, productName;
        if (category) {
            const selectedCategory = await Category.findById(category);
            categoryName = selectedCategory.name;
            items.push({ itemType: 'category', itemId: category, itemName: categoryName });
        }
        if (product) {
            const selectedProduct = await Product.findById(product);
            productName = selectedProduct.name;
            items.push({ itemType: 'product', itemId: product, itemName: productName });
        }



        const newOffer = new Offer({
            name,
            description,
            items,
            percentage,
            startingDate,
            expiryDate
        });

        await newOffer.save();

        console.log('new Offer.......:', newOffer);

        res.redirect('/admin/offers');
    } catch (error) {
        console.log(error.message);
    }
}

const applyOffer = async (req, res) => {
    try {
        const { offerId, productId, categoryId } = req.body;
        console.log('applyOffer.............:', req.body);

        const offer = await Offer.findById(offerId);

        if (!offer) {
            return res.status(404).send("Offer not found");
        }

        if (productId) {
            const product = await Product.findById(productId);
            if (product) {

                product.offer = offerId;
                await product.save();

            }
        }

        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (category) {

                category.offer = offerId;
                await category.save();

            }
        }
        res.status(200).send("Offer applied successfully");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
}


const removeOffer = async (req, res) => {
    try {
        const { productId, categoryId } = req.body;

        if (!productId && !categoryId) {
            return res.status(400).send("Product ID or Category ID must be provided.");
        }

        if (productId) {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).send("Product not found.");
            }

            product.offer = null;
            await product.save();
        }

        if (categoryId) {
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).send("Category not found.");
            }

            category.offer = null;
            await category.save();
        }

        res.status(200).send("Offer removed successfully.");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error.");
    }
}


module.exports = {
    loadOffers,
    loadAddOffers,
    addOffers,
    applyOffer,
    removeOffer
}