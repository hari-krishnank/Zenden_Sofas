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
            addressType: {
                type: String,
            }

        }
    ]

})

module.exports = mongoose.model('User', userSchema)