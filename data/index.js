const mongoose = require('mongoose');
const Campground = require('../model/campground')
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const API = require('./Unsplash')

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
    .then(() => {
        console.log('Mongo Connection open!')
    })
    .catch(err => {
        console.log('Oh No! Mongo Connection Error')
        console.log('Error: ', err)
    })

const requestURL = `https://api.unsplash.com/search/photos/?client_id=${API.ACCESS_KEY}&query=campground&per_page=30`;
const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 50; i++) {
        let randomImage = await getRandomImage();
        const c = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[i].city}, ${cities[i].state}`,
            image: randomImage,
            price: Math.floor(Math.random() * 20) + 10,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam, voluptate. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam .'
        });
        await c.save();
    }
}

const getRandomImage = async () => {
    const response = await fetch(requestURL);
    const data = await response.json();
    let randomNumber = Math.floor(Math.random() * (data.results.length - 1));
    return data.results[randomNumber].urls.regular;
}

// seedDB();