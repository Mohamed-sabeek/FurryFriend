const mongoose = require('mongoose');

const medicalReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Blood Report', 'X-Ray', 'Scan', 'Prescription', 'Other'],
    default: 'Other'
  },
  fileUrl: { type: String, required: true }, // Cloudinary URL
  cloudinaryId: { type: String },
  date: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MedicalReport', medicalReportSchema);
