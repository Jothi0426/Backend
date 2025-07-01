// const UserMap = require('../Models/UserMap');
// const DriverMap = require('../Models/DriverMap');
// const MatchLocation = require('../Models/MatchLocation');

// const socketController = (io) => {
//   io.on('connection', (socket) => {
//     console.log('📡 Client connected:', socket.id);

//     socket.on('update-user-location', async (data) => {
//       try {
//         const { latitude, longitude } = data;
//         const user = new UserMap({ latitude, longitude });
//         await user.save();
//         io.emit('usermapUpdate', user);
//       } catch (err) {
//         console.error('❌ User location error:', err.message);
//       }
//     });

//     socket.on('update-driver-location', async (data) => {
//       try {
//         const { driver_id, latitude, longitude, status } = data;

//         const matchLog = new MatchLocation({ driver_id, latitude, longitude, status });
//         await matchLog.save();

//         let driver;
//         if (driver_id) {
//           driver = await DriverMap.findOneAndUpdate(
//             { driver_id },
//             { latitude, longitude, status, updatedAt: Date.now() },
//             { new: true }
//           );
//         } else {
//           driver = new DriverMap({ latitude, longitude, status });
//           await driver.save();
//         }

//         io.emit('driver-location', driver);

//         const users = await UserMap.find();
//         for (const user of users) {
//           socket.emit('possibleMatch', {
//             driver_id: driver.driver_id,
//             driver_latitude: latitude,
//             driver_longitude: longitude,
//             user_id: user.user_id,
//             user_latitude: user.latitude,
//             user_longitude: user.longitude,
//           });
//         }
//       } catch (err) {
//         console.error('❌ Driver location error:', err.message);
//       }
//     });

//     socket.on('disconnect', () => {
//       console.log('❌ Client disconnected:', socket.id);
//     });
//   });
// };

// module.exports = socketController;
// const UserMap = require('../models/UserMap');
// const DriverMap = require('../models/DriverMap');
// const MatchLocation = require('../models/MatchLocation');

// exports.handleSocketEvents = (io, socket) => {
//   socket.on('update-user-location', async (data) => {
//     try {
//       const { latitude, longitude } = data;
//       const user = new UserMap({ latitude, longitude });
//       await user.save();
//       io.emit('usermapUpdate', user);

//       io.emit('ride-request', {
//         message: 'New ride request',
//         user_latitude: latitude,
//         user_longitude: longitude,
//       });
//     } catch (err) {
//       console.error('❌ Error saving user location:', err.message);
//     }
//   });

//   socket.on('update-driver-location', async (data) => {
//     try {
//       const { driver_id, latitude, longitude, status } = data;

//       const matchLog = new MatchLocation({ driver_id, latitude, longitude, status });
//       await matchLog.save();

//       let driver;
//       if (driver_id) {
//         driver = await DriverMap.findOneAndUpdate(
//           { driver_id },
//           { latitude, longitude, status, updatedAt: Date.now() },
//           { new: true, upsert: true }
//         );
//       } else {
//         driver = new DriverMap({ latitude, longitude, status });
//         await driver.save();
//       }

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
//       console.error('❌ Error updating driver location:', err.message);
//     }
//   });

//   socket.on('disconnect', () => {
//     console.log('❌ Client disconnected:', socket.id);
//   });
// };
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
      const users = await UserMap.find();
      for (const user of users) {
        const newMatch = new MatchLocation({
          driver_id,
          user_id: user.user_id,
          latitude,
          longitude,
          status: status || 'pending',
        });
        await newMatch.save();
        socket.emit('possibleMatch', {
          ride_id: newMatch.ride_id,
          driver_id,
          driver_latitude: latitude,
          driver_longitude: longitude,
          user_id: user.user_id,
          user_latitude: user.latitude,
          user_longitude: user.longitude,
        });
      }

      const driver = await DriverMap.findOneAndUpdate(
        { driver_id },
        { latitude, longitude, status, updatedAt: Date.now() },
        { new: true, upsert: true }
      );
      io.emit('driver-location', driver);
    } catch (err) {
      console.error('❌ Error updating driver location:', err.message);
    }
  });

  socket.on('ride-accepted', async (data) => {
    try {
      const { ride_id } = data;
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const ride = await MatchLocation.findOneAndUpdate(
        { ride_id },
        { status: 'accepted', otp, timestamp: Date.now() },
        { new: true }
      );
      if (ride) {
        io.emit('ride-accepted', {
          ride_id,
          driver_id: ride.driver_id,
          driver_latitude: ride.latitude,
          driver_longitude: ride.longitude,
          otp,
        });
      }
    } catch (err) {
      console.error('❌ Error in ride-accepted:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
};
