// // const mongoose = require('../db');
// // const Counter = require('./Counter');

// // const userSchema = new mongoose.Schema({
// //   user_id: { type: Number, unique: true },
// //   latitude: Number,
// //   longitude: Number,
// //   updatedAt: { type: Date, default: Date.now },
// // });

// // userSchema.pre('save', async function (next) {
// //   if (!this.isNew) return next();
// //   const counter = await Counter.findByIdAndUpdate(
// //     { _id: 'user_id' },
// //     { $inc: { seq: 1 } },
// //     { new: true, upsert: true }
// //   );
// //   this.user_id = counter.seq;
// //   next();
// // });

// // module.exports = mongoose.model('usermap', userSchema);
// const mongoose = require('mongoose');
// const Counter = require('./Counter');

// const userSchema = new mongoose.Schema({
//   user_id: { type: Number, unique: true },
//   latitude: Number,
//   longitude: Number,
//   updatedAt: { type: Date, default: Date.now },
// });

// userSchema.pre('save', async function (next) {
//   if (!this.isNew) return next();
//   const counter = await Counter.findByIdAndUpdate(
//     { _id: 'user_id' },
//     { $inc: { seq: 1 } },
//     { new: true, upsert: true }
//   );
//   this.user_id = counter.seq;
//   next();
// });

// module.exports = mongoose.model('usermap', userSchema);
const mongoose = require('mongoose');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema({
  user_id: { type: Number, unique: true },
  latitude: Number,
  longitude: Number,
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'user_id' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.user_id = counter.seq;
  next();
});

module.exports = mongoose.model('usermap', userSchema);
