// models/collectionModel.js
const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String, // URL or path to image
    default: ''
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product' // assuming you have a Product model
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Collection', collectionSchema);
