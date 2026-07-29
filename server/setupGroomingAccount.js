const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const GroomingCenter = require('./models/GroomingCenter');
const bcrypt = require('bcryptjs');

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const centers = await GroomingCenter.find({});
    console.log(`Found ${centers.length} grooming centers`);

    for (const center of centers) {
      const email = center.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@furryfriend.com';
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`User already exists for ${center.name}: ${email}`);
        continue;
      }

      const user = new User({
        fullName: center.name,
        email: email,
        password: 'password123',
        role: 'grooming',
        isVerified: true,
        groomingCenterId: center._id,
        phone: center.phone
      });

      await user.save();
      console.log(`Created Grooming Center User: ${center.name} (${email} | password123)`);
    }

    console.log('Finished setting up grooming center accounts.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

run();
