// controllers/productController.js

const Product = require('../models/productModel');

exports.getMostLovedProducts = async (req, res) => {
  try {
    // Find products with averageRating > 4, sort by rating, limit to 10 if needed
    const mostLovedProducts = await Product.find({ averageRating: { $gte: 4 } })
      .sort({ averageRating: -1, reviewCount: -1 }) // sort by rating then review count
      .limit(10); // Optional: limit to top 10

console.log('Found products:', mostLovedProducts); 
    res.status(200).json(mostLovedProducts);
  } catch (error) {
    console.error("Error fetching most loved products:", error);
    res.status(500).json({ message: 'Failed to fetch most loved products' });
  }
};

// Get latest products (New Arrivals)
exports.getNewArrivals = async (req, res) => {
  try {
    const newProducts = await Product.find({})
      .sort({ createdAt: -1 })  // Newest first
      .limit(10);               // Limit to 10 latest products

    res.status(200).json(newProducts);
  } catch (error) {
    console.error('❌ Error fetching new arrivals:', error);
    res.status(500).json({ message: 'Failed to fetch new arrivals' });
  }
};

