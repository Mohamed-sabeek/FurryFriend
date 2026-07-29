const express = require('express');
const router = express.Router();
const { getGroomingCenters, getGroomingPlan, generateGroomingPlan, bookAppointment } = require('../controllers/groomingController');
const { protect } = require('../middleware/auth');

router.get('/centers', protect, getGroomingCenters);
router.get('/:petId/plan', protect, getGroomingPlan);
router.post('/:petId/generate', protect, generateGroomingPlan);
router.post('/book', protect, bookAppointment);

module.exports = router;
