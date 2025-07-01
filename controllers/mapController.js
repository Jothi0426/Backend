const UserMap = require('../Models/UserMap');
const DriverMap = require('../Models/DriverMap');
const MatchLocation = require('../Models/MatchLocation');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserMap.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await DriverMap.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllMatches = async (req, res) => {
  try {
    const matches = await MatchLocation.find();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
