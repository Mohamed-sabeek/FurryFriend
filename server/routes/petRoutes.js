const express = require('express');
const {
  getPets,
  getPetById,
  createPet,
  updatePet,
  deletePet
} = require('../controllers/petController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Apply auth middleware to all pet routes
router.use(protect);

router
  .route('/')
  .get(getPets)
  .post(
    upload.fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'vaccinationCard', maxCount: 1 },
      { name: 'medicalReports', maxCount: 5 }
    ]),
    createPet
  );

router
  .route('/:id')
  .get(getPetById)
  .put(
    upload.fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'vaccinationCard', maxCount: 1 },
      { name: 'medicalReports', maxCount: 5 }
    ]),
    updatePet
  )
  .delete(deletePet);

module.exports = router;
