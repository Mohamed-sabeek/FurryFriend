const { 
  updateBookingStateSchema,
  searchNearbyHospitalsSchema, 
  checkUpcomingAppointmentsSchema,
  cancelAppointmentSchema
} = require('./toolSchemas');
const Pet = require('../../models/Pet');
const Appointment = require('../../models/Appointment');
const Clinic = require('../../models/Clinic');
const BookingSession = require('../../models/BookingSession');
const mongoose = require('mongoose');

const BOOKING_STATES = require('../../constants/bookingStates');

let _currentUserId = null;
let _currentConversationId = null;

const setCurrentUserId = (userId) => { _currentUserId = userId; };
const setCurrentConversationId = (convId) => { _currentConversationId = convId; };

const executeUpdateBookingState = async (args) => {
  const { state, petName, reason, date, time } = args;

  if (!_currentUserId || !_currentConversationId) {
    return { success: false, message: 'User or conversation context not available.' };
  }

  // Graceful state validation fallback
  const validStates = Object.values(BOOKING_STATES);
  if (!validStates.includes(state)) {
    console.warn(`[VetConnect AI] Invalid state received from LLM: ${state}. Ignoring update.`);
    return { 
      success: false, 
      message: `Invalid state '${state}'. You must only use one of the following states: ${validStates.join(', ')}. Please retry your action using a valid state.` 
    };
  }

  try {
    let session = await BookingSession.findOne({ conversationId: _currentConversationId });
    if (!session) {
      session = new BookingSession({
        userId: _currentUserId,
        conversationId: _currentConversationId,
        state: state
      });
    } else {
      session.state = state;
    }

    if (petName) session.petName = petName;
    if (reason) session.reason = reason;
    if (date) session.date = date;
    if (time) session.time = time;

    // Try to resolve petId if petName is provided
    if (petName && !session.petId) {
      const pet = await Pet.findOne({ owner: _currentUserId, petName: { $regex: petName, $options: 'i' } });
      if (pet) session.petId = pet._id;
    }

    await session.save();

    let responsePayload = { 
      success: true, 
      message: `State updated to ${state}. The UI will transition accordingly.`,
      action: state
    };

    if (state === 'SHOW_CLINICS') {
      console.log('Booking Step → SHOW_CLINICS');
      console.log('Searching Clinic Collection...');
      const clinics = await Clinic.find({ isOpen: true }).limit(5).lean();
      console.log(`Clinics Found → ${clinics.length}`);
      console.log('Returning SHOW_CLINICS response');
      responsePayload.clinics = clinics;
      responsePayload.message = `State updated to SHOW_CLINICS. Found ${clinics.length} clinics.`;
    }

    return responsePayload;
  } catch (error) {
    console.error('executeUpdateBookingState error:', error);
    return { success: false, message: 'Failed to update booking state.' };
  }
};

const executeSearchNearbyHospitals = async () => {
  try {
    const clinics = await Clinic.find({ isOpen: true }).limit(5).lean();
    
    // Send action payload for the frontend
    return {
      success: true,
      action: 'SHOW_CLINICS',
      clinics: clinics,
      message: `Found ${clinics.length} veterinary clinics.`
    };
  } catch (error) {
    console.error('executeSearchNearbyHospitals error:', error);
    return {
      success: false,
      message: 'Unable to retrieve nearby clinics.'
    };
  }
};

const executeCheckUpcomingAppointments = async () => {
  if (!_currentUserId) return { success: false, appointments: [], message: 'User context not available.' };

  try {
    let appointments = await Appointment.find({
      user: _currentUserId,
      status: { $in: ['Pending', 'Confirmed', 'Checked In'] }
    })
    .populate('pet', 'petName species profileImage')
    .sort({ date: 1 });

    const today = new Date();
    const currentHour = today.getHours();
    today.setHours(0, 0, 0, 0);

    const isPastDue = (appt) => {
      const apptDate = new Date(appt.date);
      apptDate.setHours(0, 0, 0, 0);
      if (apptDate < today) return true;
      if (apptDate.getTime() === today.getTime()) {
        const t = appt.time || '';
        if (t.includes('Morning') && currentHour >= 12) return true;
        if (t.includes('Afternoon') && currentHour >= 16) return true;
        if (t.includes('Evening') && currentHour >= 20) return true;
      }
      return false;
    };

    const savePromises = [];
    const activeAppointments = [];
    
    for (let a of appointments) {
      if (isPastDue(a)) {
        a.status = 'Completed';
        savePromises.push(a.save());
      } else {
        activeAppointments.push(a.toObject());
      }
    }
    
    if (savePromises.length > 0) {
      await Promise.all(savePromises);
    }
    
    appointments = activeAppointments.slice(0, 5);

    if (!appointments.length) {
      return { success: true, appointments: [], message: 'No upcoming appointments found. Proceed with booking.' };
    }

    const formatted = appointments.map(a => ({
      id: a._id.toString(),
      petName: a.pet?.petName || 'Your pet',
      petSpecies: a.pet?.species || '',
      petImage: a.pet?.profileImage || '',
      appointmentType: a.type,
      hospitalName: a.hospitalName || 'Clinic',
      date: new Date(a.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      time: a.time,
      status: a.status,
      isEmergency: a.isEmergency,
      reason: a.reason
    }));

    return {
      success: true,
      appointments: formatted,
      count: formatted.length,
      message: `Found ${formatted.length} upcoming appointment(s).`
    };
  } catch (err) {
    console.error('checkUpcomingAppointments error:', err.message);
    return { success: false, appointments: [], message: 'Could not check appointments.' };
  }
};

const executeCancelAppointment = async (args) => {
  const { appointmentId } = args;
  if (!appointmentId) return { success: false, message: 'No appointment ID provided.' };

  try {
    const updated = await Appointment.findOneAndUpdate(
      { _id: appointmentId, user: _currentUserId },
      { status: 'Cancelled' },
      { new: true }
    ).populate('pet', 'petName');

    if (!updated) return { success: false, message: 'Appointment not found or unauthorised.' };

    return {
      success: true,
      appointmentId,
      petName: updated.pet?.petName || 'Your pet',
      message: `Appointment for ${updated.pet?.petName || 'your pet'} has been successfully cancelled.`
    };
  } catch (err) {
    console.error('cancelAppointment error:', err.message);
    return { success: false, message: 'Failed to cancel appointment.' };
  }
};

const toolRegistry = {
  updateBookingState: { schema: updateBookingStateSchema, execute: executeUpdateBookingState },
  searchNearbyHospitals: { schema: searchNearbyHospitalsSchema, execute: executeSearchNearbyHospitals },
  checkUpcomingAppointments: { schema: checkUpcomingAppointmentsSchema, execute: executeCheckUpcomingAppointments },
  cancelAppointment: { schema: cancelAppointmentSchema, execute: executeCancelAppointment }
};

const getAllToolSchemas = () => Object.values(toolRegistry).map(t => t.schema);

module.exports = {
  toolRegistry,
  getAllToolSchemas,
  setCurrentUserId,
  setCurrentConversationId
};
