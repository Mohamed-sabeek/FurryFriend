const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  phone: { type: String },
  email: { type: String },
  rating: { type: Number, default: 5.0 },
  image: { type: String },
  isOpen: { type: Boolean, default: true },
  openingHours: { type: String },
  distance: { type: Number },
  availableSlots: [{ type: String }],
  workingDays: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);
