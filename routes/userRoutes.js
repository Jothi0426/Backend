

const express = require('express');
const router = express.Router();

const {
  getUserMap,
  getMatchLocations,
} = require('../controllers/locationController');

// REST API endpoints for fetching data
router.get('/usermap', getUserMap);
router.get('/matchlocations', getMatchLocations);

module.exports = router;
