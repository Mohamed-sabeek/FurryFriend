const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  visitType: { type: String, required: true }, // e.g., 'General Checkup', 'Vaccination', 'Surgery'
  hospital: { type: String, required: true },
  doctor: { type: String },
  visitDate: { type: Date, required: true, default: Date.now },
  symptoms: [{ type: String }],
  diagnosis: { type: String },
  treatment: { type: String },
  notes: { type: String },
  prescriptionFiles: [{ type: String }], // Cloudinary URLs
  reportFiles: [{ type: String }] // Cloudinary URLs
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
