
const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const moment = require('moment')
const Coupon = require('../models/couponModel')
require("dotenv").config();

const Razorpay = require('razorpay');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env
const instance = new Razorpay({
    key_id: RAZORPAY_ID_KEY,
    key_secret: RAZORPAY_SECRET_KEY,
});


const loadCheckout = async (req, res) => {
    try {
        let user;

        console.log('check', req.session.userId);
        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }

        const cart = await Cart.findOne({ user_id: req.session.userId }).populate({
            path: "items.product_id",
            populate: [
                {
                    path: "offer",
                },
                {
                    path: "category",
                    populate: {
                        path: "offer",
                    },
                },
            ],
        })
        console.log('ccccccccccccccccccc:', cart.items[0].product_id);


        let subTotal = 0;
        if (cart) {
            cart.items.forEach((cartItem) => {
                let product = cartItem.product_id;
                let itemQuantity = cartItem.quantity;
                let itemPrice = product.price;
                let itemTotal;

                if (product.offer) {
                    // Calculate discounted price based on product's offer percentage
                    let discount = Math.round(itemPrice * (product.offer.percentage / 100));
                    itemTotal = itemPrice - discount;
                } else if (product.category && product.category.offer) {
                    // Calculate discounted price based on category's offer percentage
                    let discount = Math.round(itemPrice * (product.category.offer.percentage / 100));
                    itemTotal = itemPrice - discount;
                } else {
                    itemTotal = itemPrice; // No offer, use original price
                }

                subTotal += itemQuantity * itemTotal;
            });
        }
        console.log(subTotal);

        const coupons = await Coupon.find({});
        const userAddresses = user ? user.Address : [];
        res.render('users/checkout', { User: user, cart, userAddresses, subTotal, coupons })
    } catch (error) {
        console.log(error.message);
    }
}

const addNewAddress = async (req, res) => {
    try {

        const { name, phone, pincode, housename, city, state, landmark, alternateMobile } = req.body



        console.log('bodyyyy:', req.body);


        console.log('User ID from session:', req.session.userId);
        const user = await User.findOne({ _id: req.session.userId })
        console.log('userrr:', user);




        if (user) {
            await User.updateOne(
                { _id: req.session.userId },
                {
                    $push: {
                        Address: {
                            name: name,
                            mobile: phone,
                            pincode: pincode,
                            address: housename,
                            city: city,
                            state: state,
                            landmark: landmark,
                            alternateMobile: alternateMobile
                        }
                    }
                }
            );

            res.json({ success: true, message: "Address added successfully" });

        } else {
            res.status(400).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        console.log(error.message);
    }
}


const loadOrderSuccess = async (req, res) => {
    try {
        let user;

        console.log('check', req.session.userId);
        if (req.session.userId) {
            const id = req.session.userId;
            user = await User.findOne({ _id: id });
        }
        const id = req.params.id;
        console.log('OrderId:', id);
        const order = await Order.findOne({ _id: id }).populate("items.product_id");

        res.render('users/orderSuccess', { User: user, order: order })
    } catch (error) {
        console.log(error.message);
    }
}

const placeOrder = async (req, res) => {
    try {


        const userId = req.session.userId;
        console.log('sessssion:', userId);


        const date = new Date()
        const orderDate = date.toLocaleDateString();
        const delivery = new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000);
        const deliveryDate = delivery
            .toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
            })
            .replace(/\//g, "-");
        const status = 'Pending'

        const { address, payment, couponCode } = req.body;
        console.log("couponCode", couponCode);


        const cart = await Cart.findOne({ user_id: userId }).populate({
            path: "items.product_id",
            populate: [
                {
                    path: "offer",
                },
                {
                    path: "category",
                    populate: {
                        path: "offer",
                    },
                },
            ],
        });
        console.log('caaaaaaaaart........', cart);


        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in the cart' });
        }

         // Check availability of each item in the cart
         for (const cartItem of cart.items) {
            const product = cartItem.product_id;
            const requestedQuantity = cartItem.quantity;
            if (product.quantity < requestedQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough quantity available for product ${product.name}`,
                });
            }
        }

        let total = 0;
        const orderItems = cart.items.map((cartItem) => {
            const product = cartItem.product_id;
            let itemPrice = product.price;

            // Apply offer discount if product has an offer
            if (product.offer) {
                const discount = Math.round(itemPrice * (product.offer.percentage / 100));
                itemPrice -= discount;
            }
            // Apply category offer discount if product's category has an offer
            else if (product.category && product.category.offer) {
                const discount = Math.round(itemPrice * (product.category.offer.percentage / 100));
                itemPrice -= discount;
            }

            // Calculate total price for the item
            const itemTotalPrice = itemPrice * cartItem.quantity;
            total += itemTotalPrice;


            return {
                product_id: cartItem.product_id,
                quantity: cartItem.quantity,
                price: itemPrice,
                total_price: cartItem.quantity * itemPrice,

                offer: product.offer || null,
            };
        });

        let totalAmount = total;
        console.log('totalAmount', totalAmount);
        let discountAmount;

        if (couponCode) {
            const userClaimed = await Coupon.findOne({
                couponCode: couponCode,
                "userUsed.user_id": userId
            })

            if (!userClaimed) {
                const coupon = await Coupon.findOne({ couponCode: couponCode })
                console.log('cthogrh',couponCode);
                totalAmount -= coupon.discountAmount;
                console.log('tooooootal:',totalAmount);

                await Coupon.updateOne(
                    {_id:coupon._id},
                    {$push:{userUsed:{user_id:userId}}}
                );


            } else {
                return res.status(400).json({
                    success:false, error:'already claimed'
                })
            }
        }

        console.log('ordeeeeerrrrr iteeemmmmms:', orderItems);
        const userData = await User.findOne({ _id: userId });

        const order = new Order({
            user_id: userId,
            items: orderItems,
            delivery_address: address,
            user_name: userData.name,
            payment: payment,
            date: orderDate,
            status: status,
            total_amount: totalAmount,
            expected_delivery: deliveryDate


        });

        let orderData = await order.save();
        const orderId = orderData._id;



        for (let i = 0; i < cart.items.length; i++) {
            const productId = cart.items[i].product_id;
            const count = cart.items[i].quantity;

            await Product.updateOne(
                { _id: productId },
                { $inc: { quantity: -count } }
            );


        }
        console.log('orderId:', orderId, 'subTotal:', total);
        if (payment == "COD") {
            await Cart.deleteOne({ user_id: userId });
            console.log("order placed");
            await Order.findByIdAndUpdate(orderId, { status: 'Placed' });
            return res.json({ success: true, params: orderId });

        } else {
            const orderid = orderData._id;
            const total = orderData.total_amount;
            console.log("orderid:", orderid);
            console.log("total:", total);
            var options = {
                amount: total * 100, // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderid,
            };
            console.log('options:', options);
            instance.orders.create(options, function (err, order) {
                console.log(order);
                return res.json({ success: true, orderId: orderId, razorpayOrder: order }); // For RazorPay

            });
        }


    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }


}

const verifyPayment = async (req, res) => {
    try {
        const userId = req.session.userId
        const details = req.body
        console.log('details:::', details)
        const crypto = require('crypto')

        const secretKey = process.env.RAZORPAY_SECRET_KEY;

        const hmac = crypto.createHmac('sha256', secretKey)
        console.log('haaaac:', hmac);
        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)

        const hmacFormat = hmac.digest('hex')
        console.log('hex-hmaaac:', hmac);

        if (hmacFormat == details.payment.razorpay_signature) {
            await Order.findByIdAndUpdate(
                { _id: details.razorpayOrder.receipt },
                { $set: { paymentId: details.payment.razorpay_payment_id } }
            );


            await Order.findByIdAndUpdate(
                { _id: details.razorpayOrder.receipt },
                { $set: { status: "placed" } }
            );
            await Cart.deleteOne({ user_id: userId });
            // const userData = await User.findOne({ _id: req.session.userId })


            res.json({ success: true, params: details.razorpayOrder.receipt });
        } else {
            await Order.findByIdAndDelete({ _id: details.razorpayOrder.receipt });
            res.json({ success: false });
        }


    } catch (error) {
        console.log(error.message)
    }
}

//--------------------------------------------------------------------------------------------------


module.exports = {
    loadCheckout,
    addNewAddress,
    loadOrderSuccess,
    placeOrder,
    verifyPayment
}


