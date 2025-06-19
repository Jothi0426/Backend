const UserMap = require('../Models/UserMap');
const DriverMap = require('../Models/DriverMap');
const MatchLocation = require('../Models/MatchLocation');

module.exports = (io, socket) => {
  socket.on('update-user-location', async (data) => {
    try {
      const { latitude, longitude } = data;
      const user = new UserMap({ latitude, longitude });
      await user.save();
      io.emit('usermapUpdate', user);
    } catch (err) {
      console.error('❌ Error updating user location:', err.message);
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
          { new: true }
        );
      } else {
        driver = new DriverMap({ latitude, longitude, status });
        await driver.save();
      }

      io.emit('drivermapUpdate', driver);

      const users = await UserMap.find({ isMatched: false });
      let nearestUser = null;
      let minDistance = Infinity;

      for (const user of users) {
        const dist = Math.sqrt(
          Math.pow(user.latitude - latitude, 2) +
          Math.pow(user.longitude - longitude, 2)
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearestUser = user;
        }
      }

      if (nearestUser) {
        await UserMap.updateOne({ user_id: nearestUser.user_id }, { isMatched: true });
        io.emit('possibleMatch', {
          driver_id: driver.driver_id,
          driver_latitude: latitude,
          driver_longitude: longitude,
          user_id: nearestUser.user_id,
          user_latitude: nearestUser.latitude,
          user_longitude: nearestUser.longitude,
        });
      }

    } catch (err) {
      console.error('❌ Error handling driver location:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
};

