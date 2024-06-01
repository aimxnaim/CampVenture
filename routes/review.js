const express = require('express');
// mergeParams: true is used to merge the params from the parent router
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const { reviewSchema } = require('../schema.js');
const ExpressError = require('../utils/ExpressError');

const Review = require('../model/review');
const Campground = require('../model/campground');

// Middleware to validate the review
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campground/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campground/${id}`);
}))

module.exports = router;
