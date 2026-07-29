const mongoose = require('mongoose');

const groomingAppointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  center: { type: mongoose.Schema.Types.ObjectId, ref: 'GroomingCenter', required: true },
  selectedServices: [{ type: String }],
  recommendedStyle: { type: String, default: '' },
  specialRequests: { type: String, default: '' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  report: {
    servicesPerformed: [{ type: String }],
    productsUsed: [{ type: String }],
    coatCondition: { type: String },
    skinCondition: { type: String },
    behaviour: { type: String },
    specialNotes: { type: String },
    recommendedInterval: { type: String },
    nextGroomingDate: { type: Date },
    homeCareTips: { type: String }
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

// Pre-save to auto-push timeline if status changes
groomingAppointmentSchema.pre('save', function() {
  if (this.isModified('status')) {
    this.timeline.push({ status: this.status });
  }
});

module.exports = mongoose.model('GroomingAppointment', groomingAppointmentSchema);
