const ExpressError = require('../utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('../schema.js');
const mongoose = require('mongoose');
const Campground = require('../model/campground');
const Review = require('../model/review');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: 'You must be signed in first!' });
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(message, 400));
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(',');
    return next(new ExpressError(message, 400));
  }
  next();
};

module.exports.validateCampgroundId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new ExpressError('Invalid campground id provided', 404));
  }
  next();
};

module.exports.isCampgroundExist = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    return next(new ExpressError('Campground not found', 404));
  }
  res.locals.campground = campground;
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const campground = res.locals.campground || (await Campground.findById(req.params.id));
  if (!campground) {
    return next(new ExpressError('Campground not found', 404));
  }
  if (!req.user || !campground.author.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to modify this campground.' });
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new ExpressError('Review not found', 404));
  }
  if (!req.user || !review.author.equals(req.user._id)) {
    return res.status(403).json({ success: false, message: 'You do not have permission to modify this review.' });
  }
  next();
};
