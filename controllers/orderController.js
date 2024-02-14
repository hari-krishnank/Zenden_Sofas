
const User = require('../models/userModel')
const Order = require('../models/orderModel')

const moment = require('moment')


//------------------------------------------Admin side------------------------------------------------------

const loadOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('items.product_id').sort({ createdAt: -1 });
        res.render('admin/orders', { orders })
    } catch (error) {
        console.log(error.message);
    }
}

const loadSingleOrderDetails = async (req, res) => {
    try {
        const itemId = req.query.itemId;
        const orderId = req.query.orderId;
        const mainOrder = await Order.findOne({ _id: orderId }).populate('user_id').populate('items.product_id');

        const orderItem = mainOrder.items.find(item => item._id.toString() === itemId);

        res.render('admin/order-details', { order: mainOrder, item: orderItem })
    } catch (error) {
        console.log(error.message);
    }
}


//------------------------------------------USER SIDE--------------------------------------------------


const loadOrderDetails = async (req, res) => {
    try {
        const userId = req.session.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = 3;
        const skip = (page - 1) * limit;

        const ordersCount = await Order.countDocuments({ user_id: userId });
        const totalPages = Math.ceil(ordersCount / limit);

        const orders = await Order.find({ user_id: userId })
            .populate('items.product_id')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const user = await User.findOne({ _id: userId });

        res.render('users/orderDetails', {
            User: user,
            orders: orders,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (error) {
        console.log(error.message);
    }
};


const loadOrderSingle = async (req, res) => {
    try {
        const userId = req.session.userId;
        const orderId = req.query.orderId;
        const mainOrder = await Order.findOne({ _id: orderId, user_id: userId }).populate('items.product_id');
        const user = await User.findOne({ _id: userId });

        const item = mainOrder.items.find(item => item._id.toString() === req.query.itemId);
        res.render('users/orderSingle', { order: mainOrder, user, item, moment, User: user })
    } catch (error) {
        console.log(error.message);
    }
}


const cancelOrder = async (req, res) => {

    const orderId = req.body.orderId;
    console.log('orderId:', orderId);
    const itemId = req.body.itemId;
    console.log('itemId:', itemId);

    try {

        const updatedOrder = await Order.updateOne(
            { _id: orderId, 'items._id': itemId },
            {
                $set: {
                    'items.$.ordered_status': 'request_cancellation',

                }
            }
        );

        res.status(200).json({ message: 'Order cancellation requested', order: updatedOrder });


    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}


const returnOrder = async (req, res) => {
    const orderId = req.body.orderId;
    const itemId = req.body.itemId;

    try {

        const updatedOrder = await Order.updateOne(
            { _id: orderId, 'items._id': itemId },
            { $set: { 'items.$.ordered_status': 'request_return' } }
        );

        res.status(200).json({ success: true, message: 'Order return requested', order: updatedOrder });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};




const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.body.orderId
        console.log('dsdsdsdsdsd:', orderId);
        const itemId = req.body.itemId
        console.log('ghghghghg:', itemId);
        const newStatus = req.body.newStatus
        console.log('fffsssfssfs:', newStatus);

        const order = await Order.findOne({ _id: orderId });
        const orderItem = order.items.find(item => item._id.toString() === itemId);
        console.log('orderItem:',orderItem);

        if (orderItem) {
            if (
                (order.payment == "RazorPay" && (newStatus === "cancelled" || newStatus === "returned")) || newStatus === "returned"
            ) {
                const user = await User.findById(order.user_id)
                console.log('order.user_id', user);
                const currentDate = new Date()
                const walletHistoryEntry = {
                    date: currentDate,
                    amount: orderItem.total_price,
                    description: `Refund for order`,
                };

                // Update wallet history and wallet amount
                user.wallet_history.push(walletHistoryEntry);
                user.wallet += orderItem.total_price;
                await user.save();
            }
        }
        orderItem.ordered_status = newStatus;
        await order.save();
        res.json({ success: true });
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    loadOrders,
    loadSingleOrderDetails,
    loadOrderDetails,
    loadOrderSingle,
    updateOrderStatus,
    cancelOrder,
    returnOrder,

}