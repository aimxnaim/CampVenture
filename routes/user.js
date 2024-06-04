const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware/middleware');

const user = require('../controllers/user');
router.get('/register', user.renderRegisterPage);
router.post('/register', catchAsync(user.registerUser));
router.get('/login', user.renderLoginPage);

router.post('/login',
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    // Now we can use res.locals.returnTo to redirect the user after login
    user.loginUser
);

router.post('/logout', user.logoutUser);

module.exports = router;