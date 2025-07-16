const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      image: String,
      price: Number,
      quantity: Number,
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  paymentId: String, // Stripe session or payment intent ID
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orderStatus: {
  type: String,
  enum: ['Pending', 'Confirmed', 'cancelled'],
  default: 'Pending'
}
});

module.exports = mongoose.model('Order', orderSchema);
