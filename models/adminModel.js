const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  profilePic: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin'],
    default: 'admin'
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
