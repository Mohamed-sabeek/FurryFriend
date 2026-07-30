const Appointment = require('../models/Appointment');
const Clinic = require('../models/Clinic');
const ConsultationService = require('../services/ConsultationService');

// @desc    Get clinic dashboard stats
// @route   GET /api/clinic/dashboard
// @access  Private/Clinic
exports.getClinicDashboard = async (req, res, next) => {
  try {
    const clinicId = req.user.clinicId;
    if (!clinicId) {
      return res.status(400).json({ success: false, message: 'User is not associated with a clinic' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({ clinic: clinicId });

    const totalPatientsToday = appointments.filter(a => new Date(a.date) >= today && new Date(a.date) < tomorrow).length;
    const pendingCount = appointments.filter(a => a.status === 'Pending').length;
    const acceptedCount = appointments.filter(a => a.status === 'Accepted' || a.status === 'Confirmed').length;
    const completedCount = appointments.filter(a => a.status === 'Completed').length;
    const rejectedCount = appointments.filter(a => a.status === 'Rejected' || a.status === 'Cancelled').length;

    const recentAppointments = await Appointment.find({ clinic: clinicId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('pet', 'name profileImage species breed')
      .populate('user', 'fullName');

    res.status(200).json({
      success: true,
      clinic: req.user.clinicId, // Could populate clinic details if needed
      todayPatients: totalPatientsToday,
      pending: pendingCount,
      accepted: acceptedCount,
      completed: completedCount,
      rejected: rejectedCount,
      recentAppointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all appointments for a clinic
// @route   GET /api/clinic/appointments
// @access  Private/Vet
exports.getClinicAppointments = async (req, res, next) => {
  try {
    const clinicId = req.user.clinicId;
    if (!clinicId) {
      return res.status(403).json({ success: false, message: 'User is not assigned to a clinic' });
    }

    const { filter, search } = req.query;
    const mongoose = require('mongoose');

    let matchStage = { clinic: new mongoose.Types.ObjectId(clinicId) };

    if (filter) {
      if (filter === 'Today') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        matchStage.date = { $gte: start, $lte: end };
      } else if (filter === 'Upcoming') {
        matchStage.date = { $gte: new Date() };
        matchStage.status = { $in: ['Accepted', 'Confirmed'] };
      } else if (filter !== 'All') {
        matchStage.status = filter;
      }
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'pets',
          localField: 'pet',
          foreignField: '_id',
          as: 'pet'
        }
      },
      { $unwind: { path: '$pet', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $sort: { date: 1, time: 1 } }
    ];

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'pet.name': searchRegex },
            { 'user.fullName': searchRegex },
            { type: searchRegex }
          ]
        }
      });
    }

    const appointments = await Appointment.aggregate(pipeline);

    res.status(200).json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

// @desc    Save a consultation for an appointment
// @route   POST /api/clinic/appointments/:id/consultation
// @access  Private/Vet
exports.saveConsultation = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;
    const clinicId = req.user.clinicId;
    const doctorName = req.user.name || 'Doctor';
    const payload = req.body;

    const result = await ConsultationService.saveConsultation(appointmentId, clinicId, doctorName, payload);
    res.status(200).json(result);
  } catch (err) {
    // We send a 400 with the error message so the frontend can display it in a toast
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/clinic/appointments/:id
// @access  Private/Clinic
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, clinic: req.user.clinicId })
      .populate('pet', 'name species breed age gender weight profileImage')
      .populate('user', 'fullName phone email');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept appointment
// @route   PATCH /api/clinic/appointments/:id/accept
// @access  Private/Clinic
exports.acceptAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, clinic: req.user.clinicId });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = 'Accepted';
    appointment.acceptedAt = Date.now();
    appointment.acceptedBy = req.user._id;
    await appointment.save();

    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject appointment
// @route   PATCH /api/clinic/appointments/:id/reject
// @access  Private/Clinic
exports.rejectAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, clinic: req.user.clinicId });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = 'Rejected';
    appointment.rejectedAt = Date.now();
    await appointment.save();

    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete appointment
// @route   PATCH /api/clinic/appointments/:id/complete
// @access  Private/Clinic
exports.completeAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findOne({ _id: req.params.id, clinic: req.user.clinicId });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    appointment.status = 'Completed';
    appointment.completedAt = Date.now();
    appointment.consultationCompleted = true;
    appointment.doctorName = req.user.fullName;
    await appointment.save();

    res.status(200).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Clinic Profile
// @route   GET /api/clinic/profile
// @access  Private (Clinic only)
exports.getClinicProfile = async (req, res, next) => {
  try {
    const clinicId = req.user.clinicId;
    if (!clinicId) return res.status(403).json({ success: false, message: 'Not a clinic' });

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) return res.status(404).json({ success: false, message: 'Clinic not found' });

    res.status(200).json({ success: true, data: clinic });
  } catch (err) {
    next(err);
  }
};

// @desc    Update Clinic Profile
// @route   PUT /api/clinic/profile
// @access  Private (Clinic only)
exports.updateClinicProfile = async (req, res, next) => {
  try {
    const clinicId = req.user.clinicId;
    if (!clinicId) return res.status(403).json({ success: false, message: 'Not a clinic' });

    let clinic = await Clinic.findById(clinicId);
    if (!clinic) return res.status(404).json({ success: false, message: 'Clinic not found' });

    clinic = await Clinic.findByIdAndUpdate(
      clinicId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Also update User profile name if name changed
    if (req.body.name) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, { fullName: req.body.name });
    }

    res.status(200).json({ success: true, data: clinic });
  } catch (err) {
    next(err);
  }
};
