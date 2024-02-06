const mongoose = require("mongoose")


const offerModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    items: [{
        itemType: {
            type: String,
            enum: ['category', 'product'],
            required: true
        },
        itemId: {
            type: mongoose.Types.ObjectId,
            required: true
        },
        itemName: {
            type: String,
            required: true
        }
    }],
    startingDate: {
        type: Date,
        required: true,
    },

    expiryDate: {
        type: Date,
        required: true,
    },

    percentage: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
},
    { timestamps: true }
)

const Offer = mongoose.model('Offer', offerModel)
module.exports = Offer;