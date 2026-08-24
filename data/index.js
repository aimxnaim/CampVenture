const mongoose = require('mongoose');
const Campground = require('../model/campground')
const User = require('../model/user');
const malaysiaCampsite = require('./malaysiaCampsite');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

// ? The seeded campgrounds need a real owner, otherwise populate('author')
// ? returns null and the show page blows up on campground.author.username
const OWNER = {
    username: process.env.SEED_USERNAME || 'admin',
    email: process.env.SEED_EMAIL || 'admin@campventure.local',
    password: process.env.SEED_PASSWORD || 'password123'
};

const requestURL = `https://api.unsplash.com/search/photos/?client_id=${process.env.UNSPLASH_ACCESS_KEY}&query=campground&per_page=30`;

// ? Unsplash demo apps are capped at 50 requests/hour, so pull the pool once
// ? and cycle through it instead of firing one request per image
const getImagePool = async () => {
    const response = await fetch(requestURL);
    if (!response.ok) {
        throw new Error(`Unsplash responded ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.results || !data.results.length) {
        throw new Error('Unsplash returned no images');
    }
    return data.results;
}

const findOrCreateOwner = async () => {
    const existing = await User.findOne({ username: OWNER.username });
    if (existing) {
        console.log(`Using existing user '${OWNER.username}'`);
        return existing;
    }
    // ? register() comes from passport-local-mongoose and handles the hash + salt
    const created = await User.register(new User({
        username: OWNER.username,
        email: OWNER.email
    }), OWNER.password);
    console.log(`Created user '${OWNER.username}'`);
    return created;
}

const seedDB = async () => {
    const owner = await findOrCreateOwner();
    const pool = await getImagePool();

    await Campground.deleteMany({});

    let count = 0;
    const nextImage = () => {
        const image = pool[count % pool.length];
        count++;
        return {
            url: image.urls.regular,
            filename: image.slug,
            originalname: image.alt_description
        };
    }

    for (const site of malaysiaCampsite) {
        const c = new Campground({
            author: owner._id,
            title: site.name,
            location: `${site.city}, ${site.state}`,
            geometry: {
                type: 'Point',
                coordinates: [site.longitude, site.latitude]
            },
            image: [nextImage(), nextImage(), nextImage()],
            price: Math.floor(Math.random() * 20) + 10,
            description: site.description,
        });
        await c.save();
    }

    console.log(`Seeded ${malaysiaCampsite.length} campgrounds`);
}

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
    .then(() => {
        console.log('Mongo Connection open!')
        return seedDB();
    })
    .catch(err => {
        console.log('Oh No! Seeding Error')
        console.log('Error: ', err)
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect())
