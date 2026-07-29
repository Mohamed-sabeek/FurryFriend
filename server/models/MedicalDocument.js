const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Prescription', 'Lab Report', 'X-Ray', 'Insurance', 'Other'],
    default: 'Other'
  },
  fileUrl: { type: String, required: true }, // Cloudinary URL
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
