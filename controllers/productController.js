const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const { default: mongoose } = require('mongoose')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')


const loadProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category')
        res.render('admin/products', { products: products })
    } catch (error) {
        console.log(error.message);
    }
}


const loadAddProducts = async (req, res) => {
    try {
        const categories = await Category.find({ is_listed: 1 });

        res.render('admin/addProducts', { categories: categories })
    } catch (error) {
        console.log(error.message);
    }
}


const addProducts = async (req, res) => {
    try {
        const { productName, productCategory, productPrice, productQuantity, productDescription } = req.body

        const images = req.files.map(file => file.filename)
        console.log(req.files);
        console.log(req.body);
        console.log(images);
        const categories = await Category.find()
        if (req.files.length !== 4) {
            return res.render('admin/addProducts', { message: '4 images is allowed', categories });
        }

        const filenames = []

        for (let i = 0; i < req.files.length; i++) {
            const resizedPath = path.join(__dirname, '../public/resizedImages', req.files[i].filename)

            await sharp(req.files[i].path).resize(1000, 1000, { fit: 'fill' }).toFile(resizedPath)

            filenames.push(req.files[i].filename);
        }

        const newProduct = new Product({
            name: productName,
            category: productCategory,
            price: productPrice,
            quantity: productQuantity,
            description: productDescription,
            image: images,
            date: new Date(),
        });

        const savedProduct = await newProduct.save();


        res.redirect('/admin/products')

    } catch (error) {
        console.log(error.message);
    }
}


const listProducts = async (req, res) => {
    try {
        const { id } = req.query;
        const product = await Product.findById({ _id: id });
        if (product.is_listed === 0) {
            await Product.findByIdAndUpdate({ _id: id }, { $set: { is_listed: 1 } })

        } else {
            await Product.findByIdAndUpdate({ _id: id }, { $set: { is_listed: 0 } })
        }
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
    }
}


const loadEditProducts = async (req, res) => {
    try {
        console.log(req.query);
        const id = req.query.id


        const productData = await Product.findById({ _id: id })
        if (productData) {
            const categories = await Category.find();
            console.log(categories);
            res.render('admin/editProducts', { productData, categories })

        } else {
            res.redirect('/admin/products')
        }


    } catch (error) {
        console.log(error.message);
    }
}

const editProducts = async (req, res) => {
    try {

        const { id, productName, productCategory, productPrice, productQuantity, productDescription } = req.body

        let existingProduct = await Product.findById(id);
        let existingImages = existingProduct.image || []
        let newImages = []
        console.log('req.files:',req.files);
        if (req.files && req.files.length > 0) {

            const totalImages = existingImages.length + req.files.length;

            if (totalImages > 4) {
                const categories = await Category.find();
                return res.render('admin/editProducts', { 
                    message: "4 images are allowed",
                    productData: { name: productName, description: productDescription, image: existingImages, category: productCategory, price: productPrice, quantity: productQuantity },
                    categories: categories
                });
            }
            for (let i = 0; i < req.files.length; i++) {
                const resizedPath = path.join(__dirname, '../public/resizedImages', req.files[i].filename)
                await sharp(req.files[i].path).resize(510, 510, { fit: "fill" }).toFile(resizedPath)
                newImages.push(req.files[i].filename)
            }
        }

        // Handle deletion of images
        if (req.body.deletedImages && req.body.deletedImages.length > 0) {
            const deletedImages = req.body.deletedImages;


            // Remove deleted images from the filesystem
            for (const imageName of deletedImages) {
                fs.unlink(path.join(__dirname, '../public/resizedImages', imageName), () => { });
            }
            existingImages = existingImages.filter(img => !deletedImages.includes(img));
        }

        console.log('newImages:',newImages);


        await Product.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    name: productName,
                    category: productCategory,
                    price: productPrice,
                    quantity: productQuantity,
                    description: productDescription,

                },
                $push: { image: { $each: newImages } },

            }
        )
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteImage = async (req, res) => {
    try {
        const { imageName, id: prdtId } = req.query;
        console.log('Deleting image:', imageName, 'for product ID:', prdtId);
        fs.unlink(path.join(__dirname, '../public/resizedImages', imageName), () => { });
        await Product.updateOne(
            { _id: prdtId },
            { $pull: { image: imageName } }
        );
        res.send({ success: true });

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadProducts,
    loadAddProducts,
    addProducts,
    loadEditProducts,
    editProducts,
    listProducts,
    deleteImage
}








