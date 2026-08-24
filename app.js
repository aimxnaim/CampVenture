const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./model/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');
const swaggerUI = require('swagger-ui-express');
const cors = require('cors');

const userRoutes = require('./routes/user');
const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');

const isDevelopment = process.env.NODE_ENV === 'DEVELOPMENT';
const dbUrl = isDevelopment ? 'mongodb://localhost:27017/yelpcamp' : process.env.MONGODB_URL;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log('Mongo Connection open!');
  })
  .catch((err) => {
    console.log('Oh No! Mongo Connection Error');
    console.log('Error: ', err);
  });

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use('/openapi.json', express.static(path.join(__dirname, 'openapi.json')));
app.use(
  '/api-docs',
  swaggerUI.serve,
  swaggerUI.setup(null, {
    swaggerOptions: {
      url: '/openapi.json'
    }
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  mongoSanitize({
    replaceWith: '_'
  })
);
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
  })
);

const scriptSrcUrls = [
  'https://stackpath.bootstrapcdn.com',
  'https://api.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://kit.fontawesome.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
  'https://kit-free.fontawesome.com',
  'https://stackpath.bootstrapcdn.com',
  'https://api.mapbox.com',
  'https://api.tiles.mapbox.com',
  'https://fonts.googleapis.com',
  'https://use.fontawesome.com',
  'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
  'https://api.mapbox.com',
  'https://*.tiles.mapbox.com',
  'https://events.mapbox.com',
  ...allowedOrigins.filter(Boolean)
];
const fontSrcUrls = [
  'https://fonts.gstatic.com',
  'https://use.fontawesome.com',
  'https://cdn.jsdelivr.net'
];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", "'unsafe-inline'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      childSrc: ['blob:'],
      objectSrc: [],
      imgSrc: [
        "'self'",
        'blob:',
        'data:',
        'https://res.cloudinary.com/dzosiyaan/',
        'https://images.unsplash.com'
      ],
      fontSrc: ["'self'", ...fontSrcUrls]
    }
  })
);

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret
  }
});

store.on('error', (e) => {
  console.log('Session Store Error', e);
});

app.use(
  session({
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: isDevelopment ? 'lax' : 'none',
      secure: !isDevelopment
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use('/api/auth', userRoutes);
app.use('/api/campgrounds', campgroundRoutes);
app.use('/api/campgrounds/:id/reviews', reviewRoutes);

app.all('/api/*', (req, res, next) => {
  next(new ExpressError('API route not found', 404));
});

const clientBuildPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/openapi') || req.path.startsWith('/api-docs')) {
      return next();
    }
    return res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ success: true, message: 'CampVenture API is running' });
  });
}

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  res.status(statusCode).json({ success: false, message });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port} in ${process.env.NODE_ENV} mode`);
});
