const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  medicineName: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true }, // e.g., 'Twice a day'
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  purpose: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'Completed', 'Stopped'],
    default: 'Active'
  },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  healthRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthRecord' }
}, { timestamps: true });

module.exports = mongoose.model('Medication', medicationSchema);
