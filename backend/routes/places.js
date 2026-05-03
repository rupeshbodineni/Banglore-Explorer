const express = require('express');
const Place = require('../models/Place');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Get all places (with search and filters)
router.get('/', async (req, res) => {
  try {
    const { search, category, minRating } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    const places = await Place.find(query);
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single place by ID
router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (place) {
      res.json(place);
    } else {
      res.status(404).json({ message: 'Place not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new place (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const place = new Place(req.body);
    const createdPlace = await place.save();
    res.status(201).json(createdPlace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Categories
router.get('/utils/categories', async (req, res) => {
  try {
    const categories = ['Hotel', 'Bar', 'Cafe', 'Tourist Spot', 'Mall', 'Tech Park', 'Nightlife', 'Restaurant'];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
