const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('./db'); // connect to MongoDB

const UserMap = require('./models/UserMap');
const DriverMap = require('./models/DriverMap');
const MatchLocation = require('./models/MatchLocation');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());
app.use('/', require('./routes/mapRoutes'));

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

      let driver;
      if (driver_id) {
        driver = await DriverMap.findOneAndUpdate(
          { driver_id },
          { latitude, longitude, status, updatedAt: Date.now() },
          { new: true, upsert: true }
        );
      } else {
        driver = new DriverMap({ latitude, longitude, status });
        await driver.save();
      }

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

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
