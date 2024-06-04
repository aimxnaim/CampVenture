const express = require('express');
// mergeParams: true is used to merge the params from the parent router
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const { reviewSchema } = require('../schema.js');
const { validateReview } = require('../middleware/middleware');
const ExpressError = require('../utils/ExpressError');

const Review = require('../model/review');
const Campground = require('../model/campground');

router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campground/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('error', 'Successfully deleted review!');
    res.redirect(`/campground/${id}`);
}))

module.exports = router;
