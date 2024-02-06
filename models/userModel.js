const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, email: {
        type: String,
        required: true,
        unique: true,
    }, mobile: {
        type: String,
        required: true
    }, password: {
        type: String,
        required: true
    }, is_Admin: {
        type: Number,
        required: true
    }, is_Verified: {
        type: Number,
        default: 0
    }, isBlocked: {
        type: Number,
        default: 0,
    },
    token: {
        type: String,
        default: ''
    },
    Address: [
        {

            name: {
                type: String,
            },
            mobile: {
                type: Number,
            },
            pincode: {
                type: Number,
            },
            address: {
                type: String,
            },
            city: {
                type: String,
            },
            state: {
                type: String,
            },
            landmark: {
                type: String,
            },
            alternateMobile: {
                type: Number,
            },


        }
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    wallet: {
        type: Number,
        default: 0,
    },
    wallet_history: [
        {
            date: {
                type: Date,
            },
            amount: {
                type: Number,
            },
            description: {
                type: String,
            },
        },
    ],
    referralCode: {
        type: String
    }

},
    { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)