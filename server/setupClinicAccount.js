require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Clinic = require('./models/Clinic');

const setupAccount = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    const targetClinic = await Clinic.findOne({ name: "SKS Veterinary Hospital" });
    
    if (!targetClinic) {
      console.log('Target clinic not found!');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'clinic@sks.com' });
    if (existingUser) {
      console.log('Clinic account already exists.');
      process.exit(0);
    }

    const clinicUser = await User.create({
      fullName: "SKS Manager",
      email: "clinic@sks.com",
      password: "password123", // Will be hashed by pre-save
      role: "vet",
      isVerified: true,
      clinicId: targetClinic._id
    });

    console.log(`Successfully created clinic account for ${targetClinic.name}.`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting up clinic account:', error);
    process.exit(1);
  }
};

setupAccount();
