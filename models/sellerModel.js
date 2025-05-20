const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  profilePic: {
    type: String,
    default: '',
  },
  shopName: {
    type: String,
    required: true,
  },
  shopAddress: {
    type: String,
  },
  contactNumber: {
    type: String,
  },
  role: {
    type: String,
    enum: ['seller'],
    default: 'seller',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
