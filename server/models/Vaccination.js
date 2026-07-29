const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  vaccineName: { type: String, required: true },
  dose: { type: String },
  vaccinatedDate: { type: Date, required: true },
  nextDueDate: { type: Date },
  hospital: { type: String },
  doctor: { type: String },
  status: { 
    type: String, 
    enum: ['Completed', 'Upcoming', 'Overdue'],
    default: 'Completed'
  },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  healthRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthRecord' }
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);
