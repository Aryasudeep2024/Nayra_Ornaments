const express = require('express');
const router = express.Router();
const Product = require('../models/productModel'); // adjust path
const productController = require('../controllers/productController');


router.get('/most-loved', productController.getMostLovedProducts);

router.get('/new-arrivals', productController.getNewArrivals);
// GET products by category
router.get('/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({ category });
    res.status(200).json(products);
  } catch (err) {
    console.error('Fetch category error:', err);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});



module.exports = router;
