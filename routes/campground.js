const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { validateCampground, isLoggedIn, validateCampgroundId, isAuthor, isCampgroundExist } = require('../middleware/middleware');
const campground = require('../controllers/campground');
const multer = require('multer');
const { storage } = require('../cloudinary/cloudinary');
const upload = multer({ storage })

router.route('/')
    .get(catchAsync(campground.index))
    .post(
        isLoggedIn,
        upload.array('image', 10),
        validateCampground,
        catchAsync(campground.newCampground)
    );

router.get('/new',
    isLoggedIn,
    campground.renderNewCampgroundForm
);

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
        upload.array('image', 10),
        validateCampground,
        catchAsync(campground.updateCampground)
    )
    .delete(
        validateCampgroundId,
        isCampgroundExist,
        isLoggedIn,
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