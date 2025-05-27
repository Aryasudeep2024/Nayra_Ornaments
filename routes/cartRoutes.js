const express=require('express')
const router=express.Router()
const authUser=require('../middlewares/authUser')
const { addProductToCart,getCartItems,updateCartItemQuantity,removeCartItem,clearCart  } = require('../controllers/cartController');

router.post('/addtocart', authUser, addProductToCart);
router.get('/', authUser, getCartItems );
router.put('/update', authUser, updateCartItemQuantity );
router.delete('/remove/:productId', authUser, removeCartItem);
router.delete('/clear', authUser, clearCart);



module.exports=router;