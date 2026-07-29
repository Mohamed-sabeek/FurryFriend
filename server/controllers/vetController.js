const Appointment = require('../models/Appointment');
const Vet = require('../models/Vet');
const Clinic = require('../models/Clinic');
const MedicalReport = require('../models/MedicalReport');
const Prescription = require('../models/Prescription');

// Helper to check if an appointment has passed
const isPastDue = (appt) => {
  const apptDate = new Date(appt.date);
  apptDate.setHours(0, 0, 0, 0);
  
  const today = new Date();
  const currentHour = today.getHours();
  today.setHours(0, 0, 0, 0);

  if (apptDate < today) return true;
  if (apptDate.getTime() === today.getTime()) {
    const t = appt.time || '';
    if (t.includes('Morning') && currentHour >= 12) return true;
    if (t.includes('Afternoon') && currentHour >= 16) return true;
    if (t.includes('Evening') && currentHour >= 20) return true;
  }
  return false;
};

// @desc    Get all appointments for logged in user
// @route   GET /api/vet/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    const all = await Appointment.find({ user: req.user._id })
      .populate('pet', 'petName species breed profileImage')
      .sort({ date: -1 });

    // Auto-complete past appointments
    const savePromises = [];
    for (let a of all) {
      if (['Pending', 'Confirmed', 'Checked In'].includes(a.status) && isPastDue(a)) {
        a.status = 'Completed';
        savePromises.push(a.save());
      }
    }
    if (savePromises.length > 0) {
      await Promise.all(savePromises);
    }

    const upcoming = all.filter(a => ['Pending','Confirmed','Checked In'].includes(a.status));
    const completed = all.filter(a => a.status === 'Completed');
    const cancelled = all.filter(a => a.status === 'Cancelled');
    const pending   = all.filter(a => a.status === 'Pending');

    // Helper: extract hospital name from notes
    const getHospital = (a) => a.notes?.replace('Booked via VetConnect AI. Hospital: ', '') || 'Clinic';
    const fmt = (a) => ({ ...a.toObject(), hospitalName: getHospital(a) });

    res.status(200).json({
      success: true,
      stats: {
        upcoming: upcoming.length,
        completed: completed.length,
        cancelled: cancelled.length,
        pending: pending.length,
        total: all.length
      },
      data: {
        upcoming: upcoming.map(fmt),
        completed: completed.map(fmt),
        cancelled: cancelled.map(fmt),
        all: all.map(fmt)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an appointment (set status = Cancelled)
// @route   PATCH /api/vet/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, error: 'Appointment not found' });
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorised' });
    }
    appointment.status = 'Cancelled';
    await appointment.save();
    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking from AI session
// @route   POST /api/vet/appointments/confirm-ai
// @access  Private
exports.confirmAIBooking = async (req, res, next) => {
  try {
    const { conversationId, clinicId } = req.body;
    
    const BookingSession = require('../models/BookingSession');
    const session = await BookingSession.findOne({ conversationId, userId: req.user._id });
    
    if (!session) {
      return res.status(400).json({ success: false, error: 'Booking session not found or expired.' });
    }

    const clinic = await Clinic.findById(clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found.' });
    }

    // Determine type from reason
    const typeMap = {
      'General Checkup': 'General Checkup',
      'Vaccination': 'Vaccination',
      'Illness': 'General Checkup',
      'Injury': 'Emergency'
    };
    const mappedType = typeMap[session.reason] || 'General Checkup';

    let parsedDate = new Date();
    const lower = (session.date || '').toLowerCase();
    if (lower.includes('today')) {
      parsedDate = new Date();
    } else if (lower.includes('tomorrow')) {
      parsedDate = new Date(Date.now() + 86400000);
    } else if (lower.includes('week')) {
      parsedDate = new Date(Date.now() + 86400000 * 7);
    } else {
      const attempt = new Date(session.date);
      if (!isNaN(attempt.getTime())) parsedDate = attempt;
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      pet: session.petId,
      clinic: clinic._id,
      hospitalName: clinic.name,
      hospitalAddress: clinic.address,
      hospitalPhone: clinic.phone,
      hospitalRating: String(clinic.rating),
      type: mappedType,
      reason: session.reason,
      date: parsedDate,
      time: session.time || 'Morning',
      status: 'Confirmed',
      notes: `Booked via VetConnect AI. Hospital: ${clinic.name}`
    });

    // Delete session now that it's booked
    await BookingSession.deleteOne({ _id: session._id });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('pet', 'petName species breed profileImage')
      .populate('clinic');

    const mappedBooking = {
      petName: populatedAppointment.pet?.petName,
      petSpecies: populatedAppointment.pet?.species,
      hospitalName: populatedAppointment.hospitalName,
      appointmentType: populatedAppointment.type,
      date: new Date(populatedAppointment.date).toLocaleDateString(),
      time: populatedAppointment.time,
      status: populatedAppointment.status
    };

    const Conversation = require('../models/Conversation');
    await Conversation.findByIdAndUpdate(conversationId, {
      $push: {
        messages: {
          role: 'tool',
          name: 'bookAppointment',
          content: JSON.stringify({ success: true, ...mappedBooking })
        }
      }
    });

    res.status(201).json({ success: true, data: populatedAppointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new appointment
// @route   POST /api/vet/appointments
// @access  Private
exports.createAppointment = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user._id;

    const appointment = await Appointment.create(req.body);

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('pet', 'name species breed profileImage')
      .populate('vet', 'name profileImage specialties')
      .populate('clinic', 'name address location image');

    res.status(201).json({ success: true, data: populatedAppointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment
// @route   PUT /api/vet/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Make sure user owns appointment
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this appointment' });
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('pet', 'name species breed profileImage')
      .populate('vet', 'name profileImage specialties')
      .populate('clinic', 'name address location image');

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete appointment
// @route   DELETE /api/vet/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    // Make sure user owns appointment
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this appointment' });
    }

    await appointment.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all vets
// @route   GET /api/vet/vets
// @access  Private
exports.getVets = async (req, res, next) => {
  try {
    const vets = await Vet.find().populate('clinic');
    res.status(200).json({ success: true, count: vets.length, data: vets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all clinics
// @route   GET /api/vet/clinics
// @access  Private
exports.getClinics = async (req, res, next) => {
  try {
    const clinics = await Clinic.find();
    res.status(200).json({ success: true, count: clinics.length, data: clinics });
  } catch (error) {
    next(error);
  }
};
