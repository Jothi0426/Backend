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
