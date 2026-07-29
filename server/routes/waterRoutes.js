const express = require('express');
const { getTodayWater, getWaterHistory, logWater } = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/:petId/today', getTodayWater);
router.get('/:petId/history', getWaterHistory);
router.post('/:petId/log', logWater);

module.exports = router;
