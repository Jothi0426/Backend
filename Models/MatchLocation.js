const mongoose = require('mongoose');

const matchLocationSchema = new mongoose.Schema({
  driver_id: Number,
  latitude: Number,
  longitude: Number,
  status: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MatchLocation', matchLocationSchema);
