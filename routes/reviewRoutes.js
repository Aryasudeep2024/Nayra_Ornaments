const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authUser = require('../middlewares/authUser'); // Auth middleware

// Add a review (logged-in user only)
router.post('/', authUser, reviewController.addReview);

// Get all reviews for a product
router.get('/:productId', reviewController.getReviewsByProduct);

// Delete a review (user or admin/superadmin)
router.delete('/:reviewId', authUser, reviewController.deleteReview);

module.exports = router;
