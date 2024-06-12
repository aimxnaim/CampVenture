const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./model/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const dbUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/yelp-camp';
const MongoDBStore = require('connect-mongo');


const userRoutes = require('./routes/user');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');

mongoose.connect(dbUrl,)
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
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('__method'));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

// ? Session Configuration ; must be before the passport configuration
const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // 24 hours ; this is the time in seconds for the session to be updated in 24 hours
    crypto: {
        secret
    }
});

store.on('error', function (e) {
    console.log('Session Store Error', e);
});

app.use(session({
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1000ms * 60s * 60m * 24h * 7d = 1 week ; this is the time for the cookie to expire in 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7,// maxAge is the time in milliseconds for the cookie to expire in 1 week
        priority: 'high',
        // //secure: true,
        httpOnly: true,
    }
}));
app.use(flash());
app.use(mongoSanitize({
    replaceWith: '_',
}));
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net" // CDN for the star rating
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [
    "https://fonts.gstatic.com", // Google Fonts
    "https://use.fontawesome.com", // FontAwesome
    "https://cdn.jsdelivr.net" // CDN for the star rating
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dzosiyaan/",
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//? Passport Configuration ; must be after the session configuration ; app.use(session({...}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//?  how to store and unstore the user in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//? Middleware to show the flash messages in the views template
app.use((req, res, next) => {
    console.log(req.query);
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.use('/', userRoutes);
app.use('/campground', campgroundRoutes);
app.use('/campground/:id/review', reviewRoutes);

// // app.use((req, res, next) => {
// // res.status(404).render('404', { err: 'Page not found' });

// ? Error Handling Middleware for non-existing routes 
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

// ? Error Handling Middleware for async functions 
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port} in ${process.env.NODE_ENV} mode`);
});