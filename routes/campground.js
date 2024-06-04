const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../model/campground');
const { validateCampground, isLoggedIn } = require('../middleware/middleware');

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campground/new')
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
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

router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true, runValidators: true });
    req.flash('success', `Successfully updated <em><strong> ${campground.title} </strong></em>`)
    res.redirect(`/campground/${campground._id}`);
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'No campgrounds were found to be edited!');
        return res.redirect('/campground');
    }
    res.render('campground/edit', { campground });
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);
    req.flash('error', `Successfully deleted <em><strong> ${campground.title} </strong></em>`)
    res.redirect('/campground');
}))

module.exports = router;