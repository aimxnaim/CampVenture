const Campground = require('../model/campground');
const { cloudinary } = require('../cloudinary/cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const mapUser = (user) => {
  if (!user) {
    return null;
  }
  const plain = user.toObject ? user.toObject() : user;
  const id = plain._id || plain;
  return {
    _id: id,
    username: plain.username,
    email: plain.email
  };
};

const mapReview = (review) => {
  if (!review) {
    return null;
  }
  const plain = review.toObject ? review.toObject({ virtuals: true }) : review;
  return {
    _id: plain._id,
    body: plain.body,
    rating: plain.rating,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    author: mapUser(plain.author)
  };
};

const formatCampground = (campground) => {
  if (!campground) {
    return campground;
  }
  const doc = campground.toObject({ virtuals: true });
  return {
    _id: doc._id,
    title: doc.title,
    description: doc.description,
    location: doc.location,
    price: doc.price,
    geometry: doc.geometry,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    properties: doc.properties,
    image: (doc.image || []).map((image) => ({
      url: image.url,
      filename: image.filename,
      originalname: image.originalname
    })),
    author: mapUser(doc.author),
    reviews: Array.isArray(doc.reviews) ? doc.reviews.map(mapReview).filter(Boolean) : []
  };
};

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({}).populate('author');
  res.status(200).json({ success: true, campgrounds: campgrounds.map(formatCampground) });
};

module.exports.newCampground = async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1
    })
    .send();

  const newCampground = new Campground(req.body.campground);
  newCampground.image = (req.files || []).map((file) => ({
    url: file.path,
    filename: file.filename,
    originalname: file.originalname
  }));
  newCampground.author = req.user._id;
  if (geoData?.body?.features?.[0]?.geometry) {
    newCampground.geometry = geoData.body.features[0].geometry;
  }

  await newCampground.save();
  await newCampground.populate(['author', { path: 'reviews', populate: 'author' }]);

  res.status(201).json({ success: true, campground: formatCampground(newCampground) });
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    })
    .populate('author');

  if (!campground) {
    return res.status(404).json({ success: false, message: 'Campground not found' });
  }

  res.status(200).json({ success: true, campground: formatCampground(campground) });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground) {
    return res.status(404).json({ success: false, message: 'Campground not found' });
  }

  campground.set({ ...req.body.campground });

  const newImages = (req.files || []).map((file) => ({
    url: file.path,
    filename: file.filename,
    originalname: file.originalname
  }));
  campground.image.push(...newImages);

  const deleteImagesRaw = req.body.deleteImages;
  const deleteImages = Array.isArray(deleteImagesRaw)
    ? deleteImagesRaw
    : deleteImagesRaw
    ? [deleteImagesRaw]
    : [];

  if (deleteImages.length && deleteImages.length >= campground.image.length && newImages.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: 'You must keep at least one image associated with the campground.' });
  }

  if (deleteImages.length) {
    for (const filename of deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    campground.image = campground.image.filter((image) => !deleteImages.includes(image.filename));
  }

  await campground.save();
  const updatedCampground = await Campground.findById(id)
    .populate('author')
    .populate({
      path: 'reviews',
      populate: {
        path: 'author'
      }
    });

  res.status(200).json({ success: true, campground: formatCampground(updatedCampground) });
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground) {
    return res.status(404).json({ success: false, message: 'Campground not found' });
  }

  const images = campground.image || [];
  await Campground.findByIdAndDelete(id);

  for (const image of images) {
    if (image?.filename) {
      await cloudinary.uploader.destroy(image.filename).catch(() => undefined);
    }
  }

  res.status(200).json({ success: true, message: 'Campground deleted successfully' });
};
