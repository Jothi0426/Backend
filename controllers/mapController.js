const UserMap = require('../Models/UserMap');
const DriverMap = require('../Models/DriverMap');
const MatchLocation = require('../Models/MatchLocation');

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
    const locations = await MatchLocation.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
