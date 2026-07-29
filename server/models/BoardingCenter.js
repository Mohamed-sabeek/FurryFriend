const mongoose = require('mongoose');

const boardingCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    logo: {
      type: String,
      default: 'default-logo.jpg'
    },
    coverImage: {
      type: String,
      default: 'default-cover.jpg'
    },
    galleryImages: [{
      type: String
    }],
    rating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    dailyPrice: {
      type: Number,
      required: true
    },
    availableCapacity: {
      type: Number,
      required: true
    },
    maximumCapacity: {
      type: Number,
      required: true
    },
    petTypesAccepted: [{
      type: String,
      enum: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']
    }],
    workingHours: {
      open: { type: String, required: true },
      close: { type: String, required: true }
    },
    facilities: [{
      type: String
    }],
    services: [{
      type: String
    }],
    vaccinationRequired: {
      type: Boolean,
      default: true
    },
    emergencyVet: {
      type: Boolean,
      default: false
    },
    pickupDrop: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('BoardingCenter', boardingCenterSchema);
