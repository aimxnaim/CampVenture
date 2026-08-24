const passport = require('passport');
const User = require('../model/user');

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }
  return {
    _id: user._id,
    username: user.username,
    email: user.email
  };
};

module.exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);

    await new Promise((resolve, reject) => {
      req.login(registeredUser, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    res.status(201).json({ success: true, user: sanitizeUser(registeredUser) });
  } catch (error) {
    error.statusCode = error.statusCode || 400;
    next(error);
  }
};

module.exports.loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({ success: false, message: info?.message || 'Invalid username or password' });
    }
    req.login(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }
      return res.status(200).json({ success: true, user: sanitizeUser(user) });
    });
  })(req, res, next);
};

module.exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
};

module.exports.currentUser = (req, res) => {
  res.status(200).json({ success: true, user: sanitizeUser(req.user) });
};
