const mongoose = require('mongoose')




const orderModel = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order_id: {
    type: String,
    
  },
  delivery_address: {
    type: String,
    required: true
  },
  user_name: {
    type: String,
    required: true
  },
  payment: {
    type: String,
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  expected_delivery: {
    type: String,
    required: true

  },
  status: {
    type: String,
    required: true
  },
  paymentId: {
    type: String
  },
  total: {
    type: Number,

  },
  items: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number, 
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    total_price: {
      type: Number,
      required: true
    },
    ordered_status: {
      type: String,
      default: "pending"
    },
    cancellationReason: {
      type: String
    },

  }]


},
  { timestamps: true }
)

const Order = mongoose.model('Order', orderModel)
module.exports = Order;  