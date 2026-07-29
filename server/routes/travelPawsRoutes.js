const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateBoardingPlan } = require('../controllers/travelPawsController');

router.get('/plan/:petId', protect, generateBoardingPlan);

module.exports = router;
