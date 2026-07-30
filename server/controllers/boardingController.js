const BoardingCenter = require('../models/BoardingCenter');
const BoardingAppointment = require('../models/BoardingAppointment');
const BoardingRecord = require('../models/BoardingRecord');
const Pet = require('../models/Pet');
const User = require('../models/User');

exports.getNearbyCenters = async (req, res) => {
  try {
    const { city } = req.query;
    let query = { isActive: true };
    if (city) {
      query.city = { $regex: new RegExp(city, 'i') };
    }
    const centers = await BoardingCenter.find(query);
    res.status(200).json({ success: true, data: centers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCenterById = async (req, res) => {
  try {
    const center = await BoardingCenter.findById(req.params.id);
    if (!center) {
      return res.status(404).json({ success: false, message: 'Center not found' });
    }
    res.status(200).json({ success: true, data: center });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const { petId, centerId, checkInDate, checkOutDate, specialInstructions, feedingInstructions, emergencyContact, medicationNotes, duration, estimatedCost } = req.body;

    const appointment = await BoardingAppointment.create({
      user: req.user._id,
      pet: petId,
      center: centerId,
      checkInDate,
      checkOutDate,
      specialInstructions,
      feedingInstructions,
      emergencyContact,
      medicationNotes,
      duration,
      estimatedCost,
      timeline: [{ status: 'Pending' }]
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCustomerAppointments = async (req, res) => {
  try {
    const appointments = await BoardingAppointment.find({ user: req.user._id })
      .populate('center', 'name logo coverImage address city phone')
      .populate('pet', 'petName species breed profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCenterAppointments = async (req, res) => {
  try {
    const appointments = await BoardingAppointment.find({ center: req.user.boardingCenterId })
      .populate('user', 'fullName email phone')
      .populate('pet', 'petName species breed age weight vaccinationStatus profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await BoardingAppointment.findOne({
      _id: req.params.id,
      center: req.user.boardingCenterId
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or unauthorized' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.completeBoardingStay = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      generalHealth, eatingBehaviour, sleepingPattern, playActivity, socialBehaviour,
      medicationGiven, productsUsed, healthObservations, weightChange, specialIncidents,
      dailyNotes, overallStaySummary, homeCareAdvice, recommendedNextBoarding
    } = req.body;

    const appointment = await BoardingAppointment.findOne({
      _id: id,
      center: req.user.boardingCenterId
    }).populate('center', 'name');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Appointment already completed' });
    }

    // Create Boarding Record
    const record = await BoardingRecord.create({
      appointmentId: appointment._id,
      petId: appointment.pet,
      centerId: appointment.center._id,
      generalHealth,
      eatingBehaviour,
      sleepingPattern,
      playActivity,
      socialBehaviour,
      medicationGiven,
      productsUsed,
      healthObservations,
      weightChange,
      specialIncidents,
      dailyNotes,
      overallStaySummary,
      homeCareAdvice,
      recommendedNextBoarding
    });

    appointment.status = 'Completed';
    await appointment.save();

    // Update Pet Profile
    const pet = await Pet.findById(appointment.pet);
    if (pet) {
      const boardingData = {
        date: new Date(),
        center: appointment.center._id,
        centerName: appointment.center.name,
        checkIn: appointment.checkInDate,
        checkOut: appointment.checkOutDate,
        duration: appointment.duration,
        staySummary: overallStaySummary,
        nextBoarding: recommendedNextBoarding,
        appointmentId: appointment._id,
        recordId: record._id
      };

      pet.latestBoarding = boardingData;
      pet.boardingHistory.push(boardingData);
      
      // Invalidate AI Cache so TravelPaws knows to regenerate
      if (pet.aiSummaryCached) {
        pet.aiSummaryCached.isOutdated = true;
      }

      await pet.save();
    }

    res.status(200).json({ success: true, data: { appointment, record } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCenterStats = async (req, res) => {
  try {
    const centerId = req.user.boardingCenterId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [appointments, activeStays] = await Promise.all([
      BoardingAppointment.find({ center: centerId }).populate('pet', 'petName breed species profileImage').populate('user', 'fullName phone'),
      BoardingAppointment.find({ center: centerId, status: 'Checked In' })
    ]);

    const stats = {
      todayCheckIns: appointments.filter(a => new Date(a.checkInDate) >= today && new Date(a.checkInDate) < new Date(today.getTime() + 86400000)).length,
      todayCheckOuts: appointments.filter(a => new Date(a.checkOutDate) >= today && new Date(a.checkOutDate) < new Date(today.getTime() + 86400000)).length,
      pending: appointments.filter(a => a.status === 'Pending').length,
      accepted: appointments.filter(a => a.status === 'Accepted').length,
      checkedIn: activeStays.length,
      completed: appointments.filter(a => a.status === 'Completed').length,
      cancelled: appointments.filter(a => a.status === 'Cancelled').length,
      recentBookings: appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Boarding Center Profile
// @route   GET /api/boarding/center/profile
// @access  Private (Center only)
exports.getCenterProfile = async (req, res) => {
  try {
    const centerId = req.user.boardingCenterId;
    if (!centerId) return res.status(403).json({ success: false, message: 'Not a boarding center' });

    const center = await BoardingCenter.findById(centerId);
    if (!center) return res.status(404).json({ success: false, message: 'Center not found' });

    res.status(200).json({ success: true, data: center });
  } catch (error) {
    console.error('Error getting boarding center profile:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Update Boarding Center Profile
// @route   PUT /api/boarding/center/profile
// @access  Private (Center only)
exports.updateCenterProfile = async (req, res) => {
  try {
    const centerId = req.user.boardingCenterId;
    if (!centerId) return res.status(403).json({ success: false, message: 'Not a boarding center' });

    let center = await BoardingCenter.findById(centerId);
    if (!center) return res.status(404).json({ success: false, message: 'Center not found' });

    center = await BoardingCenter.findByIdAndUpdate(
      centerId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // Also update User profile name if name changed
    if (req.body.name) {
      await User.findByIdAndUpdate(req.user.id, { fullName: req.body.name });
    }

    res.status(200).json({ success: true, data: center });
  } catch (error) {
    console.error('Error updating boarding center profile:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
