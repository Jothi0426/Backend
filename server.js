
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const fetch = require('node-fetch');

// ==== MongoDB Connection ====
const username = 'Nithya';
const password = encodeURIComponent('sxTw_hMfv#37iQh');
const cluster = 'cluster0.z7nbp.mongodb.net';
const dbname = 'drivermap';
const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(uri)
  .then(() => console.info('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ==== Schemas ====
const counterSchema = new mongoose.Schema({ _id: String, seq: Number });
const Counter = mongoose.model('counter', counterSchema);

const userSchema = new mongoose.Schema({
  user_id: { type: Number, unique: true },
  latitude: Number,
  longitude: Number,
  updatedAt: { type: Date, default: Date.now },
  pushToken: String,
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
const UserMap = mongoose.model('usermap', userSchema);

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
const DriverMap = mongoose.model('drivermap', driverSchema);

const matchLocationSchema = new mongoose.Schema({
  driver_id: Number,
  latitude: Number,
  longitude: Number,
  status: String,
  timestamp: { type: Date, default: Date.now },
});
const MatchLocation = mongoose.model('matchlocations', matchLocationSchema);

const otpSchema = new mongoose.Schema({
  driver_id: Number,
  user_id: Number,
  otp: String,
  createdAt: { type: Date, default: Date.now, expires: 300 },
});
const OTPModel = mongoose.model('otp', otpSchema);

// ==== Express Setup ====
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// ==== REST Routes ====

app.post('/register-user-token', async (req, res) => {
  const { token, user_id } = req.body;
  try {
    const user = await UserMap.findOneAndUpdate(
      { user_id },
      { pushToken: token },
      { upsert: true, new: true }
    );
    console.info(`✅ Push token registered for user_id ${user_id}`);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error registering push token:', err.message);
    res.status(500).send('Failed to store token');
  }
});

app.post('/verify-otp', async (req, res) => {
  const { driver_id, user_id, otp } = req.body;
  try {
    const record = await OTPModel.findOne({ driver_id, user_id }).sort({ createdAt: -1 });
    if (record && record.otp === otp) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (err) {
    console.error('❌ OTP verification error:', err.message);
    res.status(500).json({ success: false });
  }
});

app.get('/usermap', async (_, res) => {
  try {
    const users = await UserMap.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/drivermap', async (_, res) => {
  try {
    const drivers = await DriverMap.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/matchlocations', async (_, res) => {
  try {
    const matches = await MatchLocation.find();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==== SOCKET.IO Events ====

io.on('connection', (socket) => {
  console.info('📡 Client connected:', socket.id);

  socket.on('user-destination', (data) => {
    console.log('📍 Destination from user:', data);
    io.emit('destination-for-driver', data);
  //   user_id,

  // driver_id,

  // latitude: destLat,

  // longitude: destLng,

  // destination: destinationAddress,
 
  });

  socket.on('update-user-location', async (data) => {
    try {
      const { latitude, longitude } = data;
      const user = new UserMap({ latitude, longitude });
      await user.save();

      io.emit('usermapUpdate', user);
      io.emit('ride-request', {
        message: 'New ride request',
        user_id: user.user_id,
        user_latitude: latitude,
        user_longitude: longitude,
      });
    } catch (err) {
      console.error('❌ Saving user location failed:', err.message);
    }
  });

  socket.on('update-driver-location', async (data) => {
    try {
      const { driver_id, latitude, longitude, status } = data;

      const matchLog = new MatchLocation({ driver_id, latitude, longitude, status });
      await matchLog.save();

      const driver = await DriverMap.findOneAndUpdate(
        { driver_id },
        { latitude, longitude, status, updatedAt: Date.now() },
        { new: true, upsert: true }
      );

      io.emit('driver-location', driver);

      const users = await UserMap.find();
      for (const user of users) {
        socket.emit('possibleMatch', {
          driver_id: driver.driver_id,
          driver_latitude: latitude,
          driver_longitude: longitude,
          user_id: user.user_id,
          user_latitude: user.latitude,
          user_longitude: user.longitude,
        });
      }
    } catch (err) {
      console.error('❌ Updating driver location failed:', err.message);
    }
  });

  socket.on('ride-accepted', async (data) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const rideData = { ...data, otp };

    try {
      await OTPModel.create({ driver_id: data.driver_id, user_id: data.user_id, otp });
      io.emit('ride-accepted', rideData);

      const user = await UserMap.findOne({ user_id: data.user_id });
      if (user?.pushToken) {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: user.pushToken,
            sound: 'default',
            title: 'Ride Accepted',
            body: `Your driver accepted the ride. OTP: ${otp}`,
          }),
        });
      }
    } catch (err) {
      console.error('❌ Ride accepted error:', err.message);
    }
  });

  // 🔼 NEW: Handle route updates from driver

socket.on('driver-route-update', ({ user_id, route }) => {

  console.log(`🛣️ Route update from driver for user ${user_id}`);
 
  // Find the assigned driver socket for this user

  const driverSocketId = rideMap.get(user_id);
 
  // Forward the route to the user app

  io.emit('driver-route-update', { route });
 
  // ⚠️ Optional: if you want to only send to that specific user

  // io.to(userSocketId).emit('driver-route-update', { route });

});

 
//New 
      socket.on('ride-completed', ({ user_id }) => {
    console.log(`✅ Ride completed for user_id: ${user_id}`);
    io.emit('ride-completed', { user_id });
  });
  socket.on('disconnect', () => {
    console.info('❌ Client disconnected:', socket.id);
  });
});

// ==== Start Server ====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.info(`🚀 Server running on http://localhost:${PORT}`);
});

// const express = require('express');
// const cors = require('cors');
// const http = require('http');
// const { Server } = require('socket.io');
// const locationRoutes = require('./routes/mapRoutes'); 
// const handleSocketConnection = require('./controllers/socketController'); 

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: { origin: '*', methods: ['GET', 'POST'] },
// });

// app.use(cors());
// app.use(express.json());
// app.use('/', locationRoutes);

// // Delegate socket logic
// io.on('connection', (socket) => {
//   handleSocketConnection(io, socket);
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.info(`🚀 Server running on http://localhost:${PORT}`);
// });




// const express = require('express');

// const mongoose = require('mongoose');

// const cors = require('cors');

// const http = require('http');

// const { Server } = require('socket.io');

// const fetch = require('node-fetch');
 
// // ==== MongoDB Connection ====

// const username = 'Nithya';

// const password = encodeURIComponent('sxTw_hMfv#37iQh');

// const cluster = 'cluster0.z7nbp.mongodb.net';

// const dbname = 'drivermap';

// const uri = `mongodb+srv://${username}:${password}@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Cluster0`;
 
// mongoose.connect(uri)

//   .then(() => console.info('✅ MongoDB connected'))

//   .catch((err) => console.error('❌ MongoDB connection error:', err));
 
// // ==== Schemas ====

// const counterSchema = new mongoose.Schema({ _id: String, seq: Number });

// const Counter = mongoose.model('counter', counterSchema);
 
// const userSchema = new mongoose.Schema({

//   user_id: { type: Number, unique: true },

//   latitude: Number,

//   longitude: Number,

//   updatedAt: { type: Date, default: Date.now },

//   pushToken: String,

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

// const UserMap = mongoose.model('usermap', userSchema);
 
// const driverSchema = new mongoose.Schema({

//   driver_id: { type: Number, unique: true },

//   latitude: Number,

//   longitude: Number,

//   status: { type: String, default: 'available' },

//   updatedAt: { type: Date, default: Date.now },

// });

// driverSchema.pre('save', async function (next) {

//   if (!this.isNew) return next();

//   const counter = await Counter.findByIdAndUpdate(

//     { _id: 'driver_id' },

//     { $inc: { seq: 1 } },

//     { new: true, upsert: true }

//   );

//   this.driver_id = counter.seq;

//   next();

// });

// const DriverMap = mongoose.model('drivermap', driverSchema);
 
// const matchLocationSchema = new mongoose.Schema({

//   driver_id: Number,

//   latitude: Number,

//   longitude: Number,

//   status: String,

//   timestamp: { type: Date, default: Date.now },

// });

// const MatchLocation = mongoose.model('matchlocations', matchLocationSchema);
 
// const otpSchema = new mongoose.Schema({

//   driver_id: Number,

//   user_id: Number,

//   otp: String,

//   createdAt: { type: Date, default: Date.now, expires: 300 },

// });

// const OTPModel = mongoose.model('otp', otpSchema);
 
// // ==== Express Setup ====

// const app = express();

// const server = http.createServer(app);

// const io = new Server(server, {

//   cors: { origin: '*', methods: ['GET', 'POST'] },

// });
 
// app.use(cors());

// app.use(express.json());
 
// // ==== In-memory Ride Map ====

// const rideMap = new Map(); // 🔼 ADDED: user_id -> driver socket.id
 
// // ==== REST Routes ====

// app.post('/register-user-token', async (req, res) => {

//   const { token, user_id } = req.body;

//   try {

//     const user = await UserMap.findOneAndUpdate(

//       { user_id },

//       { pushToken: token },

//       { upsert: true, new: true }

//     );

//     console.info(`✅ Push token registered for user_id ${user_id}`);

//     res.sendStatus(200);

//   } catch (err) {

//     console.error('❌ Error registering push token:', err.message);

//     res.status(500).send('Failed to store token');

//   }

// });
 
// app.post('/verify-otp', async (req, res) => {

//   const { driver_id, user_id, otp } = req.body;

//   try {

//     const record = await OTPModel.findOne({ driver_id, user_id }).sort({ createdAt: -1 });

//     if (record && record.otp === otp) {

//       return res.json({ success: true });

//     } else {

//       return res.json({ success: false });

//     }

//   } catch (err) {

//     console.error('❌ OTP verification error:', err.message);

//     res.status(500).json({ success: false });

//   }

// });
 
// app.get('/usermap', async (_, res) => {

//   try {

//     const users = await UserMap.find();

//     res.json(users);

//   } catch (err) {

//     res.status(500).json({ error: err.message });

//   }

// });
 
// app.get('/drivermap', async (_, res) => {

//   try {

//     const drivers = await DriverMap.find();

//     res.json(drivers);

//   } catch (err) {

//     res.status(500).json({ error: err.message });

//   }

// });
 
// app.get('/matchlocations', async (_, res) => {

//   try {

//     const matches = await MatchLocation.find();

//     res.json(matches);

//   } catch (err) {

//     res.status(500).json({ error: err.message });

//   }

// });
 
// // ==== SOCKET.IO Events ====

// io.on('connection', (socket) => {

//   console.info('📡 Client connected:', socket.id);
 
//   socket.on('user-destination', (data) => {

//     console.log('📍 Destination from user:', data);

//     io.emit('destination-for-driver', data);

//   });
 
//   socket.on('update-user-location', async (data) => {

//     try {

//       const { latitude, longitude } = data;

//       const user = new UserMap({ latitude, longitude });

//       await user.save();
 
//       io.emit('usermapUpdate', user);

//       io.emit('ride-request', {

//         message: 'New ride request',

//         user_id: user.user_id,

//         user_latitude: latitude,

//         user_longitude: longitude,

//       });

//     } catch (err) {

//       console.error('❌ Saving user location failed:', err.message);

//     }

//   });
 
//   socket.on('update-driver-location', async (data) => {

//     try {

//       const { driver_id, latitude, longitude, status } = data;
 
//       const matchLog = new MatchLocation({ driver_id, latitude, longitude, status });

//       await matchLog.save();
 
//       const driver = await DriverMap.findOneAndUpdate(

//         { driver_id },

//         { latitude, longitude, status, updatedAt: Date.now() },

//         { new: true, upsert: true }

//       );
 
//       io.emit('driver-location', driver);
 
//       const users = await UserMap.find();

//       for (const user of users) {

//         socket.emit('possibleMatch', {

//           driver_id: driver.driver_id,

//           driver_latitude: latitude,

//           driver_longitude: longitude,

//           user_id: user.user_id,

//           user_latitude: user.latitude,

//           user_longitude: user.longitude,

//         });

//       }

//     } catch (err) {

//       console.error('❌ Updating driver location failed:', err.message);

//     }

//   });
 
//   socket.on('ride-accepted', async (data) => {

//     const otp = Math.floor(1000 + Math.random() * 9000).toString();

//     const rideData = { ...data, otp };
 
//     try {

//       await OTPModel.create({ driver_id: data.driver_id, user_id: data.user_id, otp });
 
//       io.emit('ride-accepted', rideData);
 
//       // 🔼 ADDED: Store assigned driver socket for user

//       rideMap.set(data.user_id, socket.id);
 
//       const user = await UserMap.findOne({ user_id: data.user_id });

//       if (user?.pushToken) {

//         await fetch('https://exp.host/--/api/v2/push/send', {

//           method: 'POST',

//           headers: {

//             Accept: 'application/json',

//             'Accept-encoding': 'gzip, deflate',

//             'Content-Type': 'application/json',

//           },

//           body: JSON.stringify({

//             to: user.pushToken,

//             sound: 'default',

//             title: 'Ride Accepted',

//             body: `Your driver accepted the ride. OTP: ${otp}`,

//           }),

//         });

//       }

//     } catch (err) {

//       console.error('❌ Ride accepted error:', err.message);

//     }

//   });
 
//   socket.on('ride-completed', ({ user_id }) => {

//     console.log(`✅ Ride completed for user_id: ${user_id}`);

//     io.emit('ride-completed', { user_id });
 
//     // 🔼 ADDED: Cleanup mapping

//     rideMap.delete(user_id);

//   });
 
//   // 🔼 ADDED: Payment successful handler

//   socket.on('payment-successful', ({ user_id }) => {

//     const driverSocketId = rideMap.get(user_id);

//     if (driverSocketId) {

//       console.log(`💰 Payment success from user ${user_id}, notifying driver ${driverSocketId}`);

//       io.to(driverSocketId).emit('payment-successful', { user_id });

//     } else {

//       console.warn(`⚠️ No driver found for user ${user_id} during payment-successful event.`);

//     }

//   });
 
//   socket.on('disconnect', () => {

//     console.info('❌ Client disconnected:', socket.id);

//     // Optional: clean up rideMap if needed

//     for (const [userId, driverSocketId] of rideMap.entries()) {

//       if (driverSocketId === socket.id) {

//         rideMap.delete(userId);

//         console.log(`🧹 Cleaned up ride for user ${userId} due to driver disconnect`);

//       }

//     }

//   });

// });
 
// // ==== Start Server ====

// const PORT = process.env.PORT || 3000;

// server.listen(PORT, () => {

//   console.info(`🚀 Server running on http://localhost:${PORT}`);

// });

 
 
