const ExpressError = require('../utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('../schema.js');
const mongoose = require('mongoose');
const Campground = require('../model/campground');
const Review = require('../model/review');

// ? Middleware for Log in CampVenture
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // add this line
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// ? Middleware to validate the campground
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

// ? Middleware to validate the review
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

// ? Middleware to store the returnTo value in res.locals
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// ? Middleware to validate the campground id
module.exports.validateCampgroundId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', `Invalid Id: No campgrounds were found!`);
        return res.redirect('/campground');
    };
    next();
}

// ? Middleware to check if the user is the author of the campground
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!req.user || !campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campground/${id}`);
    };
    next();
}

// ? Middleware to check if the user is the author of the review campground
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!req.user || !review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campground/${id}`);
    };
    next();
}

// ? Middleware to check if the campground exists
module.exports.isCampgroundExist = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'No campgrounds were found!');
        return res.redirect('/campground');
    };
    next();
}