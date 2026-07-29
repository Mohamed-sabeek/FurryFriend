const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  vet: { type: mongoose.Schema.Types.ObjectId, ref: 'Vet' },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  hospitalName: { type: String },
  placeId: { type: String },
  hospitalAddress: { type: String },
  hospitalPhone: { type: String },
  hospitalWebsite: { type: String },
  hospitalRating: { type: String },
  type: { 
    type: String, 
    enum: ['General Checkup', 'Vaccination', 'Emergency', 'Dental', 'Surgery', 'Skin', 'Nutrition', 'Behavior', 'Follow Up'],
    required: true
  },
  reason: { type: String },
  symptoms: [{ type: String }],
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Checked In', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  isEmergency: { type: Boolean, default: false },
  videoConsultation: { type: Boolean, default: false },
  homeVisit: { type: Boolean, default: false },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
