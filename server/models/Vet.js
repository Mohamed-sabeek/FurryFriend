const mongoose = require('mongoose');

const vetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialties: [{ type: String }],
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  experienceYears: { type: Number },
  rating: { type: Number, default: 5.0 },
  profileImage: { type: String },
  isAvailableForVideo: { type: Boolean, default: true },
  isAvailableForHomeVisit: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Vet', vetSchema);
