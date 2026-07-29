const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPetTimeline,
  addHealthRecord,
  addVaccination,
  addMedication,
  addDocument
} = require('../controllers/healthRecordController');

// All routes require authentication
router.use(protect);

// GET timeline
router.get('/pet/:petId', getPetTimeline);

// POST new entries
router.post('/:petId', addHealthRecord);
router.post('/vaccinations/:petId', addVaccination);
router.post('/medications/:petId', addMedication);
router.post('/documents/:petId', addDocument);

module.exports = router;
