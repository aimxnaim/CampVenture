const User = require('../model/user');

module.exports.renderRegisterPage = (req, res) => {
    res.render('users/register');
};

module.exports.registerUser = async (req, res, next) => {
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
        });
    }

    catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }
};

module.exports.renderLoginPage = (req, res) => {
    res.render('users/login');
};

module.exports.loginUser = (req, res) => {
    req.flash('success', `Welcome back <strong>${req.user.username}</strong>!`);
    const redirectUrl = res.locals.returnTo || '/campground'; // update this line to use res.locals.returnTo now
    delete res.locals.returnTo; // add this line
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', `Goodbye!`);
        res.redirect('/campground');
    });
};