const { urlencoded } = require('express');
const Campground = require('../model/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds });
};

module.exports.renderNewCampgroundForm = (req, res) => {
    res.render('campground/new')
};

module.exports.newCampground = async (req, res) => {

    const newCampground = new Campground(req.body.campground);
    // below line is to store the image in the database in the form of an array
    newCampground.image = req.files.map(file => ({ url: file.path, filename: file.filename }));
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campground/${newCampground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    // req.session.returnTo = req.originalUrl;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    res.render('campground/show', { campground })
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true, runValidators: true });

    //* we take only the data from the image array and store it in the database ; ...imgs (spread operator)
    const imgs = req.files.map(file => ({ url: file.path, filename: file.filename }))
    //* we dont want to pass the image array as it is, we want to push the new images to the existing array
    campground.image.push(...imgs);

    await campground.save();
    req.flash('success', `Successfully updated <em><strong> ${campground.title} </strong></em>`);
    res.redirect(`/campground/${campground._id}`);
};

module.exports.showEditCampgroundForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campground/edit', { campground });
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);
    req.flash('error', `Successfully deleted <em><strong> ${campground.title} </strong></em>`)
    res.redirect('/campground');
};