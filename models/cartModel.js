const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Make sure you have a Product model
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  priceAtAddTime: {
    type: Number,
    required: true
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
    unique: true // Each user has only one cart
  },
  items: [cartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', cartSchema);
