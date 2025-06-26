const express = require('express');
const router = express.Router();

const {
  getUserMap,
  getDriverMap,
  getMatchLocations,
} = require('../controllers/mapController');

router.get('/usermap', getUserMap);
router.get('/drivermap', getDriverMap);
router.get('/matchlocations', getMatchLocations);

module.exports = router;
