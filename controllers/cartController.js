
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel')

const loadCart = async (req, res) => {
    try {
        let user;
        // console.log('cart session', req.session.userId);
        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }

        if (!user) {
            res.redirect('/login')

        } else {

            const cartDetails = await Cart.findOne({ user_id: user._id }).populate({ path: 'items.product_id' })
            const userData = await User.findOne({ _id: user._id })

            let originalAmount = 0;

            if (cartDetails) {
                cartDetails.items.forEach((cartItem) => {
                    let itemTotalPrice = cartItem.total_price;
                    originalAmount += itemTotalPrice;
                })
            }
            console.log('cart:',cartDetails);
            res.render('users/cart', { User: userData, cartDetails, subTotal: originalAmount })
        }



    } catch (error) {
        console.log(error.message);
    }
}


const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body
        console.log(req.body);
        let user;
        console.log('cart session', req.session.userId);
        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }

        if (!user) {
            res.json({ success: false, message: 'User not logged in' });
            return;
            // res.redirect('/login')
        } else {
            const product = await Product.findOne({ _id: productId })
            console.log('Product:', product);
            const id = user._id;
            const cart = await Cart.findOne({ user_id: id })

            if (cart) {
                const existProduct = cart.items.find((x) => x.product_id.toString() === productId)

                if (existProduct) {
                    const newTotalQuantity = existProduct.quantity + parseInt(quantity, 10);
                    if (newTotalQuantity > product.quantity) {
                        res.json({ success: false, message: 'Exceeds available quantity' });
                        return;
                    }

                    await Cart.findOneAndUpdate(
                        { user_id: id, 'items.product_id': productId },
                        {
                            $inc: {
                                'items.$.quantity': parseInt(quantity, 10),
                                'items.$.total_price': parseInt(quantity, 10) * existProduct.price,
                            }
                        }
                    );
                } else {
                    if (parseInt(quantity, 10) > product.quantity) {
                        res.json({ success: false, message: 'Exceeds available quantity' });
                        return;
                    }


                    await Cart.findOneAndUpdate(
                        { user_id: id },
                        {
                            $push: {
                                items: {
                                    product_id: productId,
                                    quantity: quantity,
                                    price: product.price,
                                    total_price: quantity * product.price
                                }
                            }
                        }
                    )
                }
            } else {

                if (parseInt(quantity, 10) > product.quantity) {
                    res.json({ success: false, message: 'Exceeds available quantity' });
                    return;
                }

                const newCart = new Cart({
                    user_id: id,
                    items: [{
                        product_id: productId,
                        quantity: quantity,
                        price: product.price,
                        total_price: quantity * product.price
                    }]
                });
                await newCart.save();

            }
            res.json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: 'Error adding product to cart' });
    }
}



const quantityUpdate = async (req, res) => {
    try {
        console.log('body:',req.body);

        let user;
        console.log('cart session', req.session.userId);
        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }

        const productId = req.body.productId
        console.log(productId);
        const count = req.body.count
        console.log(count);
        

        const cart = await Cart.findOne({ user_id: req.session.userId });
        // console.log('cart:',cart);

        if (!cart) {
            return res.json({ success: false, message: 'Cart not found.' });
        }

        const cartProduct = cart.items.find((item) => item.product_id.toString() === productId)
        console.log('cartProducts:',cartProduct);
        if (!cartProduct) {
            return res.json({ success: false, message: 'Product not found in the cart.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            console.log('Product not found in the database.');
            return res.json({ success: false, message: 'Product not found in the database.' });
        }

        if (count == 1) {
         
            if (cartProduct.quantity < 15 && cartProduct.quantity < product.quantity) {
                await Cart.updateOne(
                    { user_id: req.session.userId, 'items.product_id': productId },
                    {
                        $inc: {
                            'items.$.quantity': 1,
                            'items.$.total_price': product.price
                        }
                    }
                );
                return res.json({ success: true });
            } else {
                const maxAllowedQuantity = Math.min( product.quantity);
                console.log('maxqty:',maxAllowedQuantity);
                return res.json({
                    success: false,
                    message: `The maximum quantity available for this product is ${maxAllowedQuantity}. Please adjust your quantity.`,
                });
            }
        } else if (count == -1) {
            if (cartProduct.quantity > 1) {
                await Cart.updateOne(
                    { user_id: req.session.userId, 'items.product_id': productId },
                    { 
                        $inc: { 
                            'items.$.quantity': -1,
                            'items.$.total_price': -product.price 
                        } 
                    }
                );  
                return res.json({ success: true });
            } else {
                return res.json({ success: false, message: 'Quantity cannot be less than 1.' });
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}



const deleteItems = async (req, res) => {
    try {
        let user;
        console.log('cart session', req.session.userId);
        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }
        const productOgId = req.body.productOgId
        const cartUser = await Cart.findOne({ user_id: user })
        if (cartUser.items.length == 1) {
            await Cart.deleteOne({ user_id: user })
        } else {
            await Cart.updateOne({ user_id: user }, { $pull: { items: { _id: productOgId } } })
        }

        res.redirect('/cart')
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadCart,
    addToCart,
    quantityUpdate,
    deleteItems
}