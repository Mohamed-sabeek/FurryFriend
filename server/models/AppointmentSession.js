const mongoose = require('mongoose');

const appointmentSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
  appointmentType: { type: String },
  hospital: { 
    name: String,
    address: String,
    distance: String,
    phone: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  date: { type: String },
  time: { type: String },
  reason: { type: String },
  status: { type: String, enum: ['InProgress', 'Completed', 'Cancelled'], default: 'InProgress' },
  currentStep: { type: String, default: 'SelectPet' }
}, { timestamps: true });

module.exports = mongoose.model('AppointmentSession', appointmentSessionSchema);
