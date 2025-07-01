// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/mapController');

// router.get('/usermap', controller.getUsers);
// router.get('/drivermap', controller.getDrivers);
// router.get('/matchlocations', controller.getMatches);

// module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/mapController');

router.get('/drivermap', controller.getDrivers);
router.get('/usermap', controller.getUsers);
router.get('/matchlocations', controller.getMatchLocations);
router.post('/verify-otp', controller.verifyOTP);

module.exports = router; // ✅ important