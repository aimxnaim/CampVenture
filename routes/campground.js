const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { campgroundSchema } = require('../schema.js');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../model/campground');

// Middleware to validate the campground
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds });
}));

router.get('/new', (req, res) => {
    res.render('campground/new')
})

router.post('/', validateCampground, catchAsync(async (req, res) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campground/${newCampground._id}`);
}))

router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    if (!campground) {
        req.flash('error', 'No campgrounds were found!');
        return res.redirect('/campground');
    }
    res.render('campground/show', { campground })
}))

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true, runValidators: true });
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campground/${campground._id}`);
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'No campgrounds were found to be edited!');
        return res.redirect('/campground');
    }
    res.render('campground/edit', { campground });
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);
    req.flash('error', `Successfully deleted ${campground.title} campground!`)
    res.redirect('/campground');
}))

module.exports = router;