const mongoose = require('mongoose');

const emergencyReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  emergencyType: {
    type: String,
    required: true
  },
  symptoms: [{
    type: String
  }],
  notes: {
    type: String
  },
  images: [{
    secure_url: { type: String, required: true },
    public_id: { type: String, required: true }
  }],
  severity: {
    type: String,
    enum: ['Low', 'Moderate', 'Critical', 'Unknown'],
    default: 'Unknown'
  },
  confidence: {
    type: Number
  },
  possibleCondition: {
    type: String
  },
  possibleCauses: [{
    type: String
  }],
  findings: [{
    type: String
  }],
  firstAid: [{
    type: String
  }],
  avoid: [{
    type: String
  }],
  recommendedProducts: [{
    type: String
  }],
  preventionTips: [{
    type: String
  }],
  estimatedRecovery: {
    type: String
  },
  needVet: {
    type: Boolean,
    default: true
  },
  visitWithin: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Analyzed', 'Resolved', 'Failed'],
    default: 'Analyzed'
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed
  },
  aiModel: {
    type: String,
    default: 'Groq Vision'
  }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyReport', emergencyReportSchema);
