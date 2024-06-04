const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../model/campground');
const { validateCampground, isLoggedIn, validateCampgroundId, isAuthor, isCampgroundExist } = require('../middleware/middleware');
const campground = require('../controllers/campground')

router.get('/', catchAsync(campground.index));
router.get('/new', isLoggedIn, campground.renderNewCampgroundForm);
router.post('/', isLoggedIn, validateCampground, catchAsync(campground.newCampground));
router.get('/:id', validateCampgroundId, isCampgroundExist, catchAsync(campground.showCampground));
router.put('/:id', validateCampgroundId, isCampgroundExist, isLoggedIn, isAuthor, validateCampground, catchAsync(campground.updateCampground));
router.get('/:id/edit', isLoggedIn, validateCampgroundId, isCampgroundExist, isAuthor, catchAsync(campground.showEditCampgroundForm));
router.delete('/:id', isLoggedIn, validateCampgroundId, isCampgroundExist, isAuthor, catchAsync(campground.deleteCampground));

module.exports = router;