// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: [1, 'Quantity must be at least 1'],

  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // one cart per user
  },
  cartItems: [cartItemSchema],
}, { timestamps: true });

// Virtual to calculate total price
cartSchema.virtual('totalAmount').get(function () {
  return this.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
});

// Ensure virtual fields are included when converting to JSON or Object
cartSchema.set('toObject', { virtuals: true });
cartSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
