const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
  validateCampgroundId,
  isCampgroundExist
} = require('../middleware/middleware');
const review = require('../controllers/review');

router.post(
  '/',
  validateCampgroundId,
  isCampgroundExist,
  isLoggedIn,
  validateReview,
  catchAsync(review.addReview)
);

router.delete(
  '/:reviewId',
  validateCampgroundId,
  isCampgroundExist,
  isLoggedIn,
  isReviewAuthor,
  catchAsync(review.deleteReview)
);

module.exports = router;
