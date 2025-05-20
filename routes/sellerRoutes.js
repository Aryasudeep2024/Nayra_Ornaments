const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const authSeller = require('../middleware/authSeller');

router.post('/register', sellerController.register);
router.post('/login', sellerController.login);
router.get('/profile', authSeller, sellerController.profile);
router.put('/profile', authSeller, sellerController.update);
router.post('/logout', authSeller, sellerController.logout);
router.delete('/:id', authSeller, sellerController.deleteSeller);

module.exports = router;
