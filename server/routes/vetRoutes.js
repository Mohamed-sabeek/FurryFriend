const express = require('express');
const {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  cancelAppointment,
  confirmAIBooking,
  getVets,
  getClinics
} = require('../controllers/vetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all vet routes
router.use(protect);

router
  .route('/appointments')
  .get(getAppointments)
  .post(createAppointment);

router
  .route('/appointments/:id')
  .put(updateAppointment)
  .delete(deleteAppointment);

router.patch('/appointments/:id/cancel', cancelAppointment);
router.post('/appointments/confirm-ai', confirmAIBooking);

router.get('/vets', getVets);
router.get('/clinics', getClinics);

module.exports = router;
