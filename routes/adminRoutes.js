const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logoutAdmin,
  getUserProfileById,
  updateUserById,
  deleteUserById,
  approveSeller,
  addProduct,
  updateProduct,
  getProductById,
  getPendingSellers,
  deleteProductByAdmin
} = require('../controllers/adminController');

const authAdmin = require('../middlewares/authAdmin');
const authorizeRoles = require('../middlewares/authorizeRoles');
const upload = require('../middlewares/multer');


// 🔓 Public Route - Admin Login
router.post('/login', login);

// 🔐 Register new seller 
router.post(
  '/register',
  authAdmin,
  authorizeRoles('superadmin'),
  register
);

// 👤 Get / Update / Delete a user by ID (Only for Super Admin)
router.route('/user/:id')
  .get(authAdmin, authorizeRoles('superadmin'), getUserProfileById)
  .put(authAdmin, authorizeRoles('superadmin'), updateUserById)
  .delete(authAdmin, authorizeRoles('superadmin'), deleteUserById);

  router.get(
  '/pending-sellers',
  authAdmin,
  authorizeRoles('superadmin'),
  getPendingSellers
);
// ✅ Approve a Seller (Super Admin)
router.put(
  '/approve-seller/:sellerId',
  authAdmin,
  authorizeRoles('superadmin'),
  approveSeller
);

// 🛒 Add Product (Super Admin only)
router.post(
  '/addproducts',
  authAdmin,
  authorizeRoles('superadmin'),
  upload.single('image'),
  addProduct
);
//get the product
router.get(
  '/product/:id',
  authAdmin,
  authorizeRoles('superadmin'),
  getProductById
);


// ✏️ Update Product by ID (Super Admin only)
router.post(
  '/updateproducts/:id',
  authAdmin,
  authorizeRoles('superadmin'),
  upload.single('image'),
  updateProduct
);

// ❌ Delete Product by ID (Super Admin only)
router.delete(
  '/delete/:productId',
  authAdmin,
  authorizeRoles('superadmin'),
  deleteProductByAdmin
);

// 🚪 Logout Admin
router.post('/logout', authAdmin, logoutAdmin);


module.exports = router;
