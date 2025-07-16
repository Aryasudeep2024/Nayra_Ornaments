const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authAdmin= require('../middlewares/authAdmin');
const authUser = require('../middlewares/authUser');

// Create order after payment success
router.post('/create', authUser, orderController.createOrder);

// Get all orders for the logged-in user
router.get('/myorders', authUser, orderController.getUserOrders);

// ✅ Get orders for products added by the seller
router.get('/seller', authUser, orderController.getSellerOrders);

// ✅ Confirm an order by seller (change orderStatus)
router.put('/seller/confirm/:orderId', authUser, orderController.confirmOrderStatus);

router.get('/adminorders', authAdmin, orderController.getSuperAdminOrders);

router.put('/adminorders/confirm/:orderId', authAdmin, orderController.confirmOrderStatus);


module.exports = router;
