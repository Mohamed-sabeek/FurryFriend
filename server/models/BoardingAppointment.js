const mongoose = require('mongoose');

const boardingAppointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  center: { type: mongoose.Schema.Types.ObjectId, ref: 'BoardingCenter', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  specialInstructions: { type: String, default: '' },
  feedingInstructions: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  medicationNotes: { type: String, default: '' },
  duration: { type: Number, required: true }, // in days
  estimatedCost: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Checked In', 'Checked Out', 'Completed', 'Cancelled', 'Rejected'], 
    default: 'Pending' 
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

// Pre-save to auto-push timeline if status changes
boardingAppointmentSchema.pre('save', function() {
  if (this.isModified('status')) {
    this.timeline.push({ status: this.status });
  }
});

module.exports = mongoose.model('BoardingAppointment', boardingAppointmentSchema);
