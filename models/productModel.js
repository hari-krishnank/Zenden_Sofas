const mongoose = require('mongoose')

const productsModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Types.ObjectId,
        // type:String,
        ref: 'category',
        required: true,
    },
    image: {
        type: [String],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer",
    },
    offerPrice: {
        type: Number,
        default: 0,
    },
    is_listed: {
        type: Number,
        default: 0,
    }

},
    { timestamps: true }
)
const Product = mongoose.model('Product', productsModel)
module.exports = Product;