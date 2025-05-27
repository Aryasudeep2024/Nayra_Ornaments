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
const { addProduct,updateProduct,deleteProductByAdmin } = require('../controllers/adminController');
const upload = require('../middlewares/multer');

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

//add new Products

router.post(
  '/addproducts',
  authAdmin,
  authorizeRoles('superadmin'),
  upload.single('image'), // ✅ multer middleware for image upload
  addProduct
);
router.post(
  '/updateproducts/:id',
  authAdmin,
  authorizeRoles('superadmin'),
  upload.single('image'), // ✅ multer middleware for image upload
  updateProduct
);
router.delete('/delete/:productId', authAdmin, authorizeRoles('superadmin'),deleteProductByAdmin);


router.post('/logout', authAdmin, logoutAdmin);

module.exports = router;
