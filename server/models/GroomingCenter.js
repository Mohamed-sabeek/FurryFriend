const mongoose = require('mongoose');

const groomingCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  pincode: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  phone: { type: String, required: true },
  
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  gallery: [{ type: String }],
  
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 0 },
  yearsExperience: { type: Number, default: 1 },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  description: { type: String },
  
  weeklySchedule: {
    Monday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    Tuesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    Wednesday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    Thursday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    Friday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    Saturday: { open: String, close: String, isClosed: { type: Boolean, default: false } },
    Sunday: { open: String, close: String, isClosed: { type: Boolean, default: false } }
  },
  
  openingHours: { type: String }, // Legacy
  
  services: [{ type: String }],
  pricing: [{ 
    serviceName: String, 
    price: Number 
  }],
  
  capacity: {
    petsPerDay: { type: Number, default: 20 }
  },
  
  facilities: [{ type: String }],
  
  socialLinks: {
    instagram: String,
    facebook: String,
    website: String,
    whatsapp: String
  },

  petTypes: [{ type: String }],
  priceRange: { type: String },
  images: [{ type: String }], // Legacy
  pickupAvailable: { type: Boolean, default: false },
  emergencyGrooming: { type: Boolean, default: false },
  supportedBreeds: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('GroomingCenter', groomingCenterSchema);
