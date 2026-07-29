const mongoose = require('mongoose');

const boardingRecordSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'BoardingAppointment', required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  centerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BoardingCenter', required: true },
  generalHealth: { type: String, default: '' },
  eatingBehaviour: { type: String, default: '' },
  sleepingPattern: { type: String, default: '' },
  playActivity: { type: String, default: '' },
  socialBehaviour: { type: String, default: '' },
  medicationGiven: { type: String, default: '' },
  productsUsed: { type: String, default: '' },
  healthObservations: { type: String, default: '' },
  weightChange: { type: String, default: '' },
  specialIncidents: { type: String, default: '' },
  dailyNotes: { type: String, default: '' },
  overallStaySummary: { type: String, default: '' },
  homeCareAdvice: { type: String, default: '' },
  recommendedNextBoarding: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('BoardingRecord', boardingRecordSchema);
