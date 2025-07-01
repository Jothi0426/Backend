// const mongoose = require('../db');

// const matchLocationSchema = new mongoose.Schema({
//   driver_id: Number,
//   latitude: Number,
//   longitude: Number,
//   status: String,
//   timestamp: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('matchlocations', matchLocationSchema);

const mongoose = require('mongoose');
const Counter = require('./Counter');

const matchLocationSchema = new mongoose.Schema({
  ride_id: { type: Number, unique: true },
  driver_id: Number,
  user_id: Number,
  latitude: Number,
  longitude: Number,
  status: String,
  otp: String,
  timestamp: { type: Date, default: Date.now },
});

matchLocationSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'ride_id' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.ride_id = counter.seq;
  next();
});

module.exports = mongoose.model('matchlocations', matchLocationSchema);
