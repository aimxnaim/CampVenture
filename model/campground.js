const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String,
    originalname: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/c_scale,h_700,w_1200');
})

// ? This is to make the virtuals show up in the JSON response when we send the data to the client side (in the clusterMap.js file)
const opts = { toJSON: { virtuals: true } };
const CampgroundSchema = new Schema({
    title: String,
    image: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // ? 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts,
    {
        timestamps: true
    })

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return '<strong><a href="/campground/' + this._id + '">' + this.title + '</a></strong><p>' + this.location + '</p>';
})

// Middleware to delete the reviews when the campground is deleted
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);