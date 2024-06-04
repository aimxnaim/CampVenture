const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../model/campground');
const { validateCampground, isLoggedIn, validateCampgroundId, isAuthor, isCampgroundExist } = require('../middleware/middleware');
const campground = require('../controllers/campground');

router.route('/')
    .get(catchAsync(campground.index))
    .post(isLoggedIn, validateCampground, catchAsync(campground.newCampground));

router.get('/new', isLoggedIn, campground.renderNewCampgroundForm);

router.route('/:id')
    .get(
        validateCampgroundId,
        isCampgroundExist,
        catchAsync(campground.showCampground)
    )
    .put(
        validateCampgroundId,
        isCampgroundExist,
        isLoggedIn,
        isAuthor,
        validateCampground,
        catchAsync(campground.updateCampground)
    )
    .delete(
        isLoggedIn,
        validateCampgroundId,
        isCampgroundExist,
        isAuthor,
        catchAsync(campground.deleteCampground)
    );

router.get('/:id/edit',
    isLoggedIn,
    validateCampgroundId,
    isCampgroundExist,
    isAuthor,
    catchAsync(campground.showEditCampgroundForm)
);

module.exports = router;