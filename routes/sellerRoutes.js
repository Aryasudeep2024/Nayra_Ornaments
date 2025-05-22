const express = require('express');
const router = express.Router();
const { registerSeller,loginSeller ,updateSellerProfile,logoutseller} = require('../controllers/sellerController');
const authAdmin = require('../middlewares/authAdmin');

// Public route for seller registration
router.post('/register', registerSeller);

// ✅ Seller Login
router.post('/login', loginSeller);



// ✅ Seller updates their own profile
router.put('/update-profile', authAdmin, updateSellerProfile);

//logout
router.post('/logout', authAdmin, logoutseller);


module.exports = router;
