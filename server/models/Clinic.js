const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  phone: { type: String },
  email: { type: String },
  
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  gallery: [{ type: String }],
  
  rating: { type: Number, default: 5.0 },
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
  
  services: [{ type: String }],
  pricing: [{ 
    serviceName: String, 
    price: Number 
  }],
  
  facilities: [{ type: String }],
  
  socialLinks: {
    instagram: String,
    facebook: String,
    website: String,
    whatsapp: String
  },

  image: { type: String }, // Legacy
  isOpen: { type: Boolean, default: true },
  openingHours: { type: String }, // Legacy
  distance: { type: Number },
  availableSlots: [{ type: String }],
  workingDays: [{ type: String }] // Legacy
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);
