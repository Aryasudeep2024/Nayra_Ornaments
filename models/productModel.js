const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or 'Customer' if you separate
    required: true
  },
  items: [orderItemSchema],

  shippingAddress: {
    fullName: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String }
  },

  paymentMethod: {
    type: String,
    enum: ['COD', 'Credit Card', 'PayPal', 'UPI'],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },

  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },

  totalAmount: {
    type: Number,
    required: true
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  orderedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
