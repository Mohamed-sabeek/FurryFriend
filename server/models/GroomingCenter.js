const mongoose = require('mongoose');

const groomingCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  phone: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  openingHours: { type: String, required: true },
  services: [{ type: String }],
  petTypes: [{ type: String }], // 'Dog', 'Cat'
  priceRange: { type: String }, // '$$', '$$$'
  images: [{ type: String }],
  description: { type: String },
  pickupAvailable: { type: Boolean, default: false },
  emergencyGrooming: { type: Boolean, default: false },
  supportedBreeds: [{ type: String }] // 'Persian', 'Golden Retriever', 'All Breeds'
}, { timestamps: true });

module.exports = mongoose.model('GroomingCenter', groomingCenterSchema);
