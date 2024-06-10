const express = require('express');
// mergeParams: true is used to merge the params from the parent router
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware/middleware');
const review = require('../controllers/review');
const campground = require('../controllers/campground');

router.get('/',
    catchAsync(campground.showCampground)
);

router.post('/',
    isLoggedIn,
    validateReview,
    catchAsync(review.addReview)
);

router.delete('/:reviewId',
    isReviewAuthor,
    catchAsync(review.deleteReview)
);

module.exports = router;
