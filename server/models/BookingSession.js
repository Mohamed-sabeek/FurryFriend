const mongoose = require('mongoose');

const bookingSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  state: { 
    type: String, 
    enum: ['SELECT_PET', 'COLLECT_REASON', 'COLLECT_DATE', 'COLLECT_TIME', 'SHOW_CLINICS', 'CONFIRM_BOOKING'],
    default: 'SELECT_PET'
  },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
  petName: { type: String },
  reason: { type: String },
  date: { type: String },
  time: { type: String },
  selectedClinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }
}, { timestamps: true });

// A user should ideally only have one active booking session per conversation
// but since the conversation ID tracks the session, we can easily find it.

module.exports = mongoose.model('BookingSession', bookingSessionSchema);
