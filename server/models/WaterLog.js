const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
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
  dateString: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

// Ensure unique index per pet per day so we upsert
waterLogSchema.index({ pet: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.model('WaterLog', waterLogSchema);
