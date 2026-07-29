const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getNearbyCenters,
  getCenterById,
  createAppointment,
  getCustomerAppointments,
  getCenterAppointments,
  updateAppointmentStatus,
  completeBoardingStay,
  getCenterStats
} = require('../controllers/boardingController');

// Customer Routes
router.get('/centers', protect, getNearbyCenters);
router.get('/centers/:id', protect, getCenterById);
router.post('/appointments', protect, createAppointment);
router.get('/customer/appointments', protect, getCustomerAppointments);

// Boarding Center Routes
router.get('/center/stats', protect, authorize('boarding'), getCenterStats);
router.get('/center/appointments', protect, authorize('boarding'), getCenterAppointments);
router.patch('/center/appointments/:id/status', protect, authorize('boarding'), updateAppointmentStatus);
router.post('/center/appointments/:id/complete', protect, authorize('boarding'), completeBoardingStay);

module.exports = router;
