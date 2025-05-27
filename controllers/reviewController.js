const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

// 1. Add a new review
const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;
    

    // Optional: prevent duplicate reviews
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    const review = new Review({ productId, userId, rating, comment });
    await review.save();

    // Update average rating
    await updateAverageRating(productId);

    res.status(201).json({ message: 'Review added successfully.', review });
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error });
  }
};

// 2. Get all reviews for a product (with user info)
const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .populate('userId', 'name') // Only populate name field
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error });
  }
};

// 3. Delete a review
 const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const user = req.user;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found.' });

    // Allow only owner, admin, or superadmin
    if (
      review.userId.toString() !== user._id.toString() &&
      user.role !== 'superadmin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this review.' });
    }

    await review.deleteOne();

    // Update average rating
    await updateAverageRating(review.productId);

    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error });
  }
};

// 4. Calculate and update average rating (used internally)
const updateAverageRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: stats[0].averageRating,
      reviewCount: stats[0].reviewCount
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      reviewCount: 0
    });
  }
};
module.exports = {
  addReview,
  getReviewsByProduct,
  deleteReview,
}; // ✅ This is also correct, but use one consistent style.
