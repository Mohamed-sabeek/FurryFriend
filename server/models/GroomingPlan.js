const mongoose = require('mongoose');

const groomingPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  
  // High-level metrics
  groomingScore: { type: Number },
  overallSummary: { type: String },
  professionalRequirement: { type: String },
  homeRecommendation: { type: String },
  
  // Detailed Analysis
  coatAnalysis: { type: String },
  skinAnalysis: { type: String },
  earHygiene: { type: String },
  eyeHygiene: { type: String },
  dentalHygiene: { type: String },
  nailCondition: { type: String },
  pawCondition: { type: String },

  // Recommendations
  recommendedStyle: {
    name: { type: String },
    reason: { type: String }
  },
  
  schedule: [{
    task: { type: String },
    frequency: { type: String }
  }],
  
  recommendedProducts: [{ type: String }],
  
  // Cache Tracking
  dataVersion: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('GroomingPlan', groomingPlanSchema);
