const express = require('express');
const router = express.Router();

const {
  register,
  //loginUser,
  getIntakeProgress,
  insertTasks,
  getWeeklyNutritionSummary,
  getWeeklyLifestyleSummary
} = require('../controllers/loginControllers');

const { upload, createProfile } = require('../controllers/profileController');

router.post('/register', register);

// router.post('/login', loginUser);

router.get('/intake_progres', getIntakeProgress);
router.post('/tasks', insertTasks);
router.get('/weekly-nutrition-summary', getWeeklyNutritionSummary);
router.get('/weekly-lifestyle-summary', getWeeklyLifestyleSummary);

router.post('/profiles', upload.single('photo'), createProfile);

module.exports = router;
