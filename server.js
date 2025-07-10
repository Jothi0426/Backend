// // const express = require('express');
// // const http = require('http');
// // const cors = require('cors');
// // const { Server } = require('socket.io');
// // const connectDB = require('./db');
// // const mapRoutes = require('./routes/mapRoutes');
// // const { handleSocketConnection } = require('./controllers/socketController');

// // // Connect to MongoDB
// // connectDB();

// // // App and Middleware
// // const app = express();
// // const server = http.createServer(app);
// // const io = new Server(server, {
// //   cors: { origin: '*', methods: ['GET', 'POST'] },
// // });

// // app.use(cors());
// // app.use(express.json());

// // // Routes
// // app.use('/', mapRoutes);

// // // Socket.IO
// // io.on('connection', (socket) => handleSocketConnection(io, socket));

// // // Start server
// // const PORT = process.env.PORT || 5000;
// // server.listen(PORT, () => {
// //   console.log(`🚀 Server running on http://localhost:${PORT}`);
// // });



// full code worked 09/07/2025
// ==== Updated Backend Code with OTP Fixes ====
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
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ==== Schemas ====
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
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

// ==== Routes ====
app.post('/register-user-token', async (req, res) => {
  const { token, user_id } = req.body;
  try {
    const user = await UserMap.findOneAndUpdate(
      { user_id },
      { pushToken: token },
      { upsert: true, new: true }
    );
    console.log(`✅ Push token registered for user_id ${user_id}: ${token}`);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Push token register error:', err.message);
    res.status(500).send('Failed to store token');
  }
});
app.post('/verify-otp', async (req, res) => {
  const { driver_id, user_id, otp } = req.body;
  console.log('🔐 OTP Verification request:', { driver_id, user_id, otp });
  try {
    const record = await OTPModel.findOne({ driver_id, user_id }).sort({ createdAt: -1 });
    if (record) {
      console.log('✅ OTP record found:', record);
    } else {
      console.warn('⚠️ No OTP record found for:', { driver_id, user_id });
    }

    if (record && record.otp === otp) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (err) {
    console.error('❌ OTP verification error:', err.message);
    return res.status(500).json({ success: false });
  }
});


app.get('/usermap', async (req, res) => {
  try {
    const users = await UserMap.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/drivermap', async (req, res) => {
  try {
    const drivers = await DriverMap.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/matchlocations', async (req, res) => {
  try {
    const matches = await MatchLocation.find();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==== SOCKET.IO Events ====
io.on('connection', (socket) => {
  console.log('📡 Client connected:', socket.id);

  socket.on('update-user-location', async (data) => {
    try {
      const { latitude, longitude } = data;
      const user = new UserMap({ latitude, longitude });
      await user.save();

      io.emit('usermapUpdate', user);
      io.emit('ride-request', {
        message: 'New ride request',
         user_id: user.user_id, // <- this is missing!
        user_latitude: latitude,
        user_longitude: longitude,
      });
    } catch (err) {
      console.error('❌ Error saving user location:', err.message);
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
      console.error('❌ Error updating driver location:', err.message);
    }
  });

  socket.on('ride-accepted', async (data) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const rideData = { ...data, otp };

    try {
      await OTPModel.create({ driver_id: data.driver_id, user_id: data.user_id, otp });
      console.log(`✅ Ride accepted, OTP ${otp} stored`);
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
        console.log(`📬 Push notification sent to user_id ${data.user_id}`);
      } else {
        console.warn(`⚠️ User ${data.user_id} has no push token`);
      }
    } catch (err) {
      console.error('❌ Error storing OTP or sending push:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// ==== Start Server ====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
