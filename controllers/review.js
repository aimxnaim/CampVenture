const Campground = require('../model/campground');
const Review = require('../model/review');

const formatReview = (review) => {
  if (!review) {
    return null;
  }
  const doc = review.toObject ? review.toObject({ virtuals: true }) : review;
  return {
    _id: doc._id,
    body: doc.body,
    rating: doc.rating,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    author: doc.author
      ? {
          _id: doc.author._id,
          username: doc.author.username,
          email: doc.author.email
        }
      : null
  };
};

module.exports.addReview = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground) {
    return res.status(404).json({ success: false, message: 'Campground not found' });
  }

  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  await review.populate('author');

  res.status(201).json({ success: true, review: formatReview(review) });
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  res.status(200).json({ success: true, message: 'Review deleted successfully' });
};
