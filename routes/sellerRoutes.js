const express = require('express');
const router = express.Router();

const { registerSeller, getSellerProfile, loginSeller, updateSellerProfile,
     resetSellerPassword, addProduct,deleteSellerAccount,
     updateProductStockAndPrice,deleteProductBySeller , getMyProducts,searchProductsByCategory,
     logoutseller } = require('../controllers/sellerController');
const authSeller = require('../middlewares/authSeller');
const upload = require('../middlewares/multer'); // This should give you `upload.single`

// Routes
router.post('/register', registerSeller);
router.post('/login', loginSeller);
router.put('/update-profile', authSeller, updateSellerProfile);
router.get('/profile', authSeller, getSellerProfile); 
router.post('/reset-password', authSeller, resetSellerPassword);
router.delete('/delete-account', authSeller, deleteSellerAccount);
router.get('/search-products', searchProductsByCategory);
router.post('/logout', authSeller, logoutseller);

// ✅ Add Products by seller
router.post('/addProducts', authSeller, upload.single('image'), addProduct);
//to fetch added products
router.get('/my', authSeller,getMyProducts);

//update price or quantity
router.put('/update/:productId', authSeller, updateProductStockAndPrice);
//delete product
router.delete('/delete/:productId', authSeller,deleteProductBySeller);



module.exports = router;
