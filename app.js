const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./model/campground')
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema } = require('./schema.js');

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
    .then(() => {
        console.log('Mongo Connection open!')
    })
    .catch(err => {
        console.log('Oh No! Mongo Connection Error')
        console.log('Error: ', err)
    })

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// below is for parsing the form data and adding it to the req.body
// every single request that comes in,it will use the express.urlencoded no matter what 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('__method'));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campground', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campground/index', { campgrounds });
}));

app.get('/campground/new', (req, res) => {
    res.render('campground/new')
})

app.post('/campground', validateCampground, catchAsync(async (req, res) => {

    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campground/${newCampground._id}`);
}))

app.get('/campground/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campground/show', { campground })
}))

app.put('/campground/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true, runValidators: true });
    res.redirect(`/campground/${campground._id}`);
}))

app.get('/campground/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campground/edit', { campground });
}))

app.delete('/campground/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
}))
app.use((req, res, next) => {
    res.status(404).render('404', { err: 'Page not found' });
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000');
});