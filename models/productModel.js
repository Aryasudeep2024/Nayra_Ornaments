const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },

  description: {
    type: String,
    required: [true, 'Product description is required'],
  },

  image: {
    type: String, // Cloudinary URL
    required: [true, 'Product image URL is required'],
  },

  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
   quantity: {
  type: Number,
  required: [true, 'Quantity is required'],
  min: [0, 'Quantity cannot be negative'],
  default: 1,
},


  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // or 'Seller' depending on your model
    required: true,
  },

  role: {
    type: String,
    enum: ['seller', 'superadmin'],
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
