const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const dotenv = require('dotenv');
const ExpressError = require('./utils/ExpressError');

const campground = require('./routes/campground');
const review = require('./routes/review');

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
    .then(() => {
        console.log('Mongo Connection open!')
    })
    .catch(err => {
        console.log('Oh No! Mongo Connection Error')
        console.log('Error: ', err)
    })

const app = express();

dotenv.config({ path: './config/config.env' });
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// below is for parsing the form data and adding it to the req.body
// every single request that comes in,it will use the express.urlencoded no matter what 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('__method'));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('home');
});

app.use('/campground', campground);
app.use('/campground/:id/review', review);

// app.use((req, res, next) => {
//     res.status(404).render('404', { err: 'Page not found' });
// 

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).render('error', { err });
})

app.listen(process.env.PORT, () => {
    console.log(`Serving on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});