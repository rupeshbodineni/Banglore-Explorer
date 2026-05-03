const mongoose = require('mongoose');

const placeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Hotel', 'Bar', 'Cafe', 'Tourist Spot', 'Mall', 'Tech Park', 'Nightlife', 'Restaurant'],
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    rating: {
      type: Number,
      default: 0,
    },
    images: [String],
    reviewsCount: {
      type: Number,
      default: 0,
    },
    priceRange: {
      type: String, // e.g. "$", "$$", "$$$"
    }
  },
  {
    timestamps: true,
  }
);

const Place = mongoose.model('Place', placeSchema);
module.exports = Place;
