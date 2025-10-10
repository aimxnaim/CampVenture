const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const user = require('../controllers/user');

router.post('/register', catchAsync(user.registerUser));
router.post('/login', user.loginUser);
router.post('/logout', user.logoutUser);
router.get('/me', user.currentUser);

module.exports = router;
