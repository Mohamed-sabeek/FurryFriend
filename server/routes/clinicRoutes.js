const express = require('express');
const {
  getClinicDashboard,
  getClinicAppointments,
  getAppointmentById,
  acceptAppointment,
  rejectAppointment,
  completeAppointment,
  saveConsultation
} = require('../controllers/clinicController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth and role middleware to all routes
router.use(protect);
router.use(authorize('vet', 'admin'));

router.get('/dashboard', getClinicDashboard);
router.get('/appointments', getClinicAppointments);
router.get('/appointments/:id', getAppointmentById);
router.patch('/appointments/:id/accept', acceptAppointment);
router.patch('/appointments/:id/reject', rejectAppointment);
router.patch('/appointments/:id/complete', completeAppointment);
router.post('/appointments/:id/consultation', saveConsultation);

module.exports = router;
