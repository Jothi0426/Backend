const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

router.get('/usermap', mapController.getAllUsers);
router.get('/drivermap', mapController.getAllDrivers);
router.get('/matchlocations', mapController.getAllMatchLocations);

module.exports = router;
