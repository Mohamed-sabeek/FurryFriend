const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Analyze emergency
router.post('/analyze', protect, upload.array('images', 3), emergencyController.analyzeEmergency);

// History and retrieval
router.get('/history', protect, emergencyController.getEmergencyHistory);
router.get('/:id', protect, emergencyController.getEmergencyReport);
router.delete('/:id', protect, emergencyController.deleteEmergencyReport);

module.exports = router;
