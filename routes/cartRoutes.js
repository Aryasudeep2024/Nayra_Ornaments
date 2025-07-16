const express=require('express')
const router=express.Router()
const authUser=require('../middlewares/authUser')
const { addProductToCart,getCartItems,updateCartItemQuantity,removeCartItem,clearCart  } = require('../controllers/cartController');
const Order = require('../models/orderModel');


// 📦 GET /orders/user - fetch all orders for the logged-in user
router.get('/user', authUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

router.post('/addtocart', authUser, addProductToCart);
router.get('/', authUser, getCartItems );
router.put('/update', authUser, updateCartItemQuantity );
router.delete('/remove/:productId', authUser, removeCartItem);
router.delete('/clear', authUser, clearCart);



module.exports=router;