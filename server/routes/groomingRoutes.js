const express = require('express');
const router = express.Router();
const { 
  getGroomingCenters, 
  getGroomingPlan, 
  generateGroomingPlan, 
  bookAppointment, 
  getCustomerGroomingAppointments,
  getCenterDashboardStats,
  getCenterAppointments,
  updateAppointmentStatus,
  completeGrooming 
} = require('../controllers/groomingController');
const { protect } = require('../middleware/auth');

// Customer routes
router.get('/centers', protect, getGroomingCenters);
router.get('/appointments/me', protect, getCustomerGroomingAppointments);
router.get('/:petId/plan', protect, getGroomingPlan);
router.post('/:petId/generate', protect, generateGroomingPlan);
router.post('/book', protect, bookAppointment);

// Grooming Center Routes
router.get('/center/stats', protect, getCenterDashboardStats);
router.get('/center/appointments', protect, getCenterAppointments);
router.patch('/center/appointments/:id/status', protect, updateAppointmentStatus);
router.post('/center/appointments/:id/complete', protect, completeGrooming);

module.exports = router;
