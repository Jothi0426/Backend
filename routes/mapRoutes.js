const express = require('express');
const router = express.Router();
const controller = require('../controllers/mapController');

router.get('/usermap', controller.getUsers);
router.get('/drivermap', controller.getDrivers);
router.get('/matchlocations', controller.getMatches);

module.exports = router;