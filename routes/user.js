const express = require('express');
const router = express.Router();
const User = require('../model/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.get('/login', (req, res) => {
    res.render('users/login');
});

module.exports = router;