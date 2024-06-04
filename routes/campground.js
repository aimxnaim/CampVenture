const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../model/campground');
const { validateCampground, isLoggedIn, validateCampgroundId, isAuthor, isCampgroundExist } = require('../middleware/middleware');
const { default: mongoose } = require('mongoose');

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campground/new')
})

router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campground/${newCampground._id}`);
}))

router.get('/:id', validateCampgroundId, isCampgroundExist, catchAsync(async (req, res) => {
    const { id } = req.params;
    // req.session.returnTo = req.originalUrl;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    res.render('campground/show', { campground })
}))

router.put('/:id', validateCampgroundId, isCampgroundExist, isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true, runValidators: true });
    req.flash('success', `Successfully updated <em><strong> ${campground.title} </strong></em>`)
    res.redirect(`/campground/${campground._id}`);
}))

router.get('/:id/edit', isLoggedIn, validateCampgroundId, isCampgroundExist, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campground/edit', { campground });
}))

router.delete('/:id', isLoggedIn, validateCampgroundId, isCampgroundExist, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);
    req.flash('error', `Successfully deleted <em><strong> ${campground.title} </strong></em>`)
    res.redirect('/campground');
}))

module.exports = router;