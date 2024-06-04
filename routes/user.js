const express = require('express');
const router = express.Router();
const User = require('../model/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware/middleware');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        // ? register is a method from passport-local-mongoose
        const registeredUser = await User.register(user, password);

        // ? call the login method from passport to log the user in after registering
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome to CampVenture <strong> ${registeredUser.username}</strong>! `);
            res.redirect('/campground');
        })


    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login',
    // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    // Now we can use res.locals.returnTo to redirect the user after login
    (req, res) => {
        req.flash('success', `Welcome back <strong>${req.user.username}</strong>!`);
        const redirectUrl = res.locals.returnTo || '/campground'; // update this line to use res.locals.returnTo now
        res.redirect(redirectUrl);
    });

router.post('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', `Goodbye!`);
        res.redirect('/campground');
    });
})

module.exports = router;