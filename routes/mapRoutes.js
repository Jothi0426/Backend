const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

router.get('/usermap', mapController.getUserMap);
router.get('/drivermap', mapController.getDriverMap);
router.get('/matchlocations', mapController.getMatchLocations);

module.exports = router;
