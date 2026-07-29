const mongoose = require('mongoose');

const groomingAppointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  center: { type: mongoose.Schema.Types.ObjectId, ref: 'GroomingCenter', required: true },
  selectedServices: [{ type: String }],
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('GroomingAppointment', groomingAppointmentSchema);
