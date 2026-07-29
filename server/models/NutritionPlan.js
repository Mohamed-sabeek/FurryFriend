const mongoose = require('mongoose');

const nutritionPlanSchema = new mongoose.Schema({
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
  planData: { 
    type: mongoose.Schema.Types.Mixed 
  }, // The full JSON from Groq
  aiReasoning: [{ type: String }],
  preferences: { 
    type: mongoose.Schema.Types.Mixed 
  }, 
  dataVersion: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema);
