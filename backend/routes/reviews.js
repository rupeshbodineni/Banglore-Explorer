const express = require('express');
const Review = require('../models/Review');
const Place = require('../models/Place');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get reviews for a place
router.get('/place/:placeId', async (req, res) => {
  try {
    const reviews = await Review.find({ place: req.params.placeId }).populate('user', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a review
router.post('/', protect, async (req, res) => {
  try {
    const { placeId, rating, comment } = req.body;

    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      place: placeId,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this place' });
    }

    const review = await Review.create({
      user: req.user._id,
      place: placeId,
      rating: Number(rating),
      comment,
    });

    // Update place rating and review count
    const place = await Place.findById(placeId);
    const reviews = await Review.find({ place: placeId });
    
    place.reviewsCount = reviews.length;
    place.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    await place.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
