const mongoose = require('mongoose')

const categoryModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false,
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer",
    },
    is_listed: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('category', categoryModel);