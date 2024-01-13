const mongoose = require('mongoose')

const cartModel = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },


    items: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },

        quantity: {
            type: Number,
            default:1
        },

        price: {
            type:Number,
            required:true
        },

        total_price: {
            type:Number,
            required:true
        },

        status: {
            type:String,
            default:"placed"    
        },

        cancellationReason:{
            type:String,
            default:"none"
        }
    }]
})

const Cart = mongoose.model('Cart',cartModel)
module.exports = Cart;