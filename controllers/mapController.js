const UserMap = require('../models/UserMap');
const DriverMap = require('../models/DriverMap');
const MatchLocation = require('../models/MatchLocation');

exports.getUserMap = async (req, res) => {
  try {
    const users = await UserMap.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDriverMap = async (req, res) => {
  try {
    const drivers = await DriverMap.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMatchLocations = async (req, res) => {
  try {
    const matches = await MatchLocation.find();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
