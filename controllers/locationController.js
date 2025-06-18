

const MatchLocation = require('../Models/MatchLocation');
const UserMap = require('../Models/UserMap');

const handleSocketConnection = (io, socket) => {
  console.log('📡 Client connected:', socket.id);

  socket.on('update-driver-location', async (data) => {
    try {
      const { driver_id, latitude, longitude, status } = data;

      const location = new MatchLocation({ driver_id, latitude, longitude, status });
      await location.save();

      const users = await UserMap.find();

      users.forEach(user => {
        socket.emit('possibleMatch', {
          driver_id,
          driver_latitude: latitude,
          driver_longitude: longitude,
          user_id: user.user_id,
          user_latitude: user.latitude,
          user_longitude: user.longitude,
        });
      });

         io.emit('driver-location', {
          driver_id,
          latitude,
          longitude,
  });
      console.log('✅ Driver location updated and broadcasted:', { driver_id, latitude, longitude, status });
    } catch (err) {
      console.error('❌ Error handling driver location:', err.message);
    }
  });

  // Handle user location updates
  socket.on('update-user-location', async (data) => {
    try {
      const { user_id, latitude, longitude } = data;
      const user = new UserMap({ user_id, latitude, longitude });
      await user.save();
      console.log('✅ User location saved:', { user_id, latitude, longitude });
    } catch (err) {
      console.error('❌ Error handling user location:', err.message);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
};

const getUserMap = async (req, res) => {
  try {
    const users = await UserMap.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user map' });
  }
};

const getMatchLocations = async (req, res) => {
  try {
    const locations = await MatchLocation.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch match locations' });
  }
};
module.exports = {
  handleSocketConnection,
  getUserMap,
  getMatchLocations,
};