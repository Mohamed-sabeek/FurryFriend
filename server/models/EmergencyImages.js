const mongoose = require('mongoose');

const emergencyImageSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyReport',
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyImage', emergencyImageSchema);
