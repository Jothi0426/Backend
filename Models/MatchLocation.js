
const mongoose = require('mongoose');

const matchLocationSchema = new mongoose.Schema({
  driver_id: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MatchLocation', matchLocationSchema);
