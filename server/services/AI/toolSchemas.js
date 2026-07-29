const BOOKING_STATES = require('../../constants/bookingStates');

const updateBookingStateSchema = {
  type: "function",
  function: {
    name: "updateBookingState",
    description: "Update the booking state machine with extracted information. Call this when the user provides the requested information for the current state.",
    parameters: {
      type: "object",
      properties: {
        state: { 
          type: "string", 
          enum: Object.values(BOOKING_STATES),
          description: "The next state to advance to" 
        },
        petName: { type: "string", description: "Extracted pet name (if any)" },
        reason: { type: "string", description: "Extracted reason (if any)" },
        date: { type: "string", description: "Extracted date (if any)" },
        time: { type: "string", description: "Extracted time (if any)" }
      },
      required: ["state"]
    }
  }
};

const searchNearbyHospitalsSchema = {
  type: "function",
  function: {
    name: "searchNearbyHospitals",
    description: "Search for nearby veterinary clinics from the database. Call this when the state transitions to SHOW_CLINICS.",
    parameters: { type: "object", properties: {}, required: [] }
  }
};

const checkUpcomingAppointmentsSchema = {
  type: "function",
  function: {
    name: "checkUpcomingAppointments",
    description: "Check MongoDB for the user's upcoming appointments. Optional utility.",
    parameters: { type: "object", properties: {}, required: [] }
  }
};

const cancelAppointmentSchema = {
  type: "function",
  function: {
    name: "cancelAppointment",
    description: "Cancel an existing appointment.",
    parameters: {
      type: "object",
      properties: {
        appointmentId: { type: "string" }
      },
      required: ["appointmentId"]
    }
  }
};

module.exports = {
  updateBookingStateSchema,
  searchNearbyHospitalsSchema,
  checkUpcomingAppointmentsSchema,
  cancelAppointmentSchema
};
