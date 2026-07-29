require('dotenv').config({path: './.env'});
const mongoose = require('mongoose');
const User = require('./models/User');
const Pet = require('./models/Pet');
const Clinic = require('./models/Clinic');
const Appointment = require('./models/Appointment');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find SKS Clinic
  let clinic = await Clinic.findOne({ email: 'clinic@sks.com' });
  if (!clinic) {
    clinic = await User.findOne({ email: 'clinic@sks.com' });
  }
  
  const user = await User.findOne({ email: 'furry1@gmail.com' });
  const pet = await Pet.findOne({ owner: user._id });

  if (!clinic || !user || !pet) {
    console.log('Missing data', { clinic: !!clinic, user: !!user, pet: !!pet });
    process.exit(1);
  }

  const appt = new Appointment({
    user: user._id,
    pet: pet._id,
    clinic: clinic._id || clinic.clinicId,
    hospitalName: clinic.name || 'SKS Veterinary Hospital',
    type: 'General Checkup',
    reason: 'Routine checkup to test the new End-to-End AI Consultation Workflow!',
    date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
    time: '10:30 AM',
    status: 'Pending',
    symptoms: ['Lethargy', 'Mild Fever']
  });
  
  await appt.save();
  console.log('Successfully inserted Pending Appointment:', appt._id);
  process.exit(0);
}
seed().catch(console.error);
