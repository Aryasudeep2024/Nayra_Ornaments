const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getUserProfileById,
  updateUserById,
  deleteUserById,
  logoutAdmin,
  approveSeller
} = require('../controllers/adminController');

const authAdmin = require('../middlewares/authAdmin');
const authorizeRoles = require('../middlewares/authorizeRoles');

// Login route (public)
router.post('/login', login);

// Register new admin (Super Admin only)
router.post('/register', authAdmin, authorizeRoles('superadmin'), register);

// ✅ Unified route: Get, Update, Delete user by ID (Super Admin only)
router
  .route('/user/:id')
  .get(authAdmin, authorizeRoles('superadmin'), getUserProfileById)
  .put(authAdmin, authorizeRoles('superadmin'), updateUserById)
  .delete(authAdmin, authorizeRoles('superadmin'), deleteUserById);

  // Super Admin approves seller
router.put('/approve-seller/:sellerId', authAdmin, authorizeRoles('superadmin'), approveSeller);

router.post('/logout', authAdmin, logoutAdmin);

module.exports = router;
