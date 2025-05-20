const express = require('express');
const router = express.Router();
const { register } = require('../controllers/adminController');
const authAdmin = require('../middleware/authAdmin');
const isSuperAdmin = require('../middleware/isSuperAdmin');

// Protected route to create new admin (only by super-admins)
router.post('/create', authAdmin, isSuperAdmin, register);
