// const UserMap = require('../Models/UserMap');
// const DriverMap = require('../Models/DriverMap');
// const MatchLocation = require('../Models/MatchLocation');
// const OTPModel = require('../Models/OTP');
// const fetch = require('node-fetch');

// module.exports = async function handleSocket(io, socket) {
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
//   });

//   socket.on('disconnect', () => {
//     console.info('❌ Client disconnected:', socket.id);
//   });
// };
