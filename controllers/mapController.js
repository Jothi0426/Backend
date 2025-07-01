
// // const UserMap = require('../Models/UserMap');
// // const DriverMap = require('../Models/DriverMap');
// // const MatchLocation = require('../Models/MatchLocation');

// // exports.getUsers = async (req, res) => {
// //   try {
// //     const users = await UserMap.find();
// //     res.json(users);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// // exports.getDrivers = async (req, res) => {
// //   try {
// //     const drivers = await DriverMap.find();
// //     res.json(drivers);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// // exports.getMatches = async (req, res) => {
// //   try {
// //     const matches = await MatchLocation.find();
// //     res.json(matches);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };
// const UserMap = require('../Models/UserMap');
// const DriverMap = require('../Models/DriverMap');
// const MatchLocation = require('../Models/MatchLocation');

// exports.getUsers = async (req, res) => {
//   try {
//     const users = await UserMap.find();
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getDrivers = async (req, res) => {
//   try {
//     const drivers = await DriverMap.find();
//     res.json(drivers);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getMatches = async (req, res) => {
//   try {
//     const matches = await MatchLocation.find();
//     res.json(matches);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const DriverMap = require('../Models/DriverMap');
const UserMap = require('../Models/UserMap');
const MatchLocation = require('../Models/MatchLocation');
const OTP = require('../Models/OTP');

exports.getDrivers = async (req, res) => {
  try {
    const drivers = await DriverMap.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await UserMap.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMatchLocations = async (req, res) => {
  try {
    const logs = await MatchLocation.find();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { driver_id, otp } = req.body;
    const otpRecord = await OTP.findOne({ driver_id, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    await OTP.deleteOne({ _id: otpRecord._id });
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};
