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
        
        const { id,productName, productCategory, productPrice, productQuantity, productDescription } = req.body

        let existingProduct = await Product.findById(id);
        let resizedImages = existingProduct.image || []

        if (
            existingProduct &&
            existingProduct.image &&
            existingProduct.image.length > 0
        ) {
            resizedImages = existingProduct.image;
        }
        if (req.files && req.files.length > 0) {
            
            const remainingSlots = 4 - resizedImages.length;

            if (req.files.length !== remainingSlots) {
                const categories = await Category.find(); 
                return res.render('admin/editProducts', {
                    message: "4 Image is Allowed",
                    productData: { name: productName, description: productDescription, image: resizedImages, category: productCategory, price: productPrice, quantity: productQuantity },
                    categories: categories
                });
            }

            for (let i = 0; i < req.files.length; i++) {
                const resizedPath = path.join(__dirname, '../public/resizedImages', req.files[i].filename)
                await sharp(req.files[i].path).resize(1000, 1000, { fit: "fill" }).toFile(resizedPath)
                resizedImages.push(req.files[i].filename)
            }
        }



        
        await Product.findByIdAndUpdate(
            { _id: id },
            {
                $set: {
                    name: productName,
                    category: productCategory,
                    price: productPrice,
                    quantity: productQuantity,
                    description: productDescription,
                    image: resizedImages.slice(0, 4),
                },
            }
        )
            res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteImage = async(req,res) =>{
    try {
        const { imageName,id:prdtId } = req.query;
        console.log('Deleting image:', imageName, 'for product ID:', prdtId);
        fs.unlink(path.join(__dirname,'../public/resizedImages',imageName),() => {});
        await Product.updateOne(
            {_id:prdtId},
            {$pull:{image:imageName}}
        );
        res.send({success:true});

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








