const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  vet: { type: mongoose.Schema.Types.ObjectId, ref: 'Vet' },
  medicines: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String }
  }],
  notes: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
