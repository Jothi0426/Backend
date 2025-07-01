
const mongoose = require('mongoose');
const Counter = require('./Counter');

const driverSchema = new mongoose.Schema({
  driver_id: { type: Number, unique: true },
  latitude: Number,
  longitude: Number,
  status: { type: String, default: 'available' },
  updatedAt: { type: Date, default: Date.now },
});

driverSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'driver_id' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.driver_id = counter.seq;
  next();
});

module.exports = mongoose.model('drivermap', driverSchema);