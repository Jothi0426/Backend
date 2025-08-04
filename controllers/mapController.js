// const UserMap = require('../Models/UserMap');
// const DriverMap = require('../Models/DriverMap');
// const MatchLocation = require('../Models/MatchLocation');
// const OTPModel = require('../Models/OTP');
// const fetch = require('node-fetch');

// exports.registerUserToken = async (req, res) => {
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
// };

// exports.verifyOTP = async (req, res) => {
//   const { driver_id, user_id, otp } = req.body;
//   try {
//     const record = await OTPModel.findOne({ driver_id, user_id }).sort({ createdAt: -1 });
//     res.json({ success: record?.otp === otp });
//   } catch (err) {
//     console.error('❌ OTP verification error:', err.message);
//     res.status(500).json({ success: false });
//   }
// };

// exports.getUserMap = async (_, res) => {
//   try {
//     const users = await UserMap.find();
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getDriverMap = async (_, res) => {
//   try {
//     const drivers = await DriverMap.find();
//     res.json(drivers);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getMatchLocations = async (_, res) => {
//   try {
//     const matches = await MatchLocation.find();
//     res.json(matches);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
