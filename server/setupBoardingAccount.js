const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const BoardingCenter = require('./models/BoardingCenter');
const User = require('./models/User');

dotenv.config();

const centers = [
  {
    name: 'Happy Stay Pet Resort',
    email: 'happystay@furryfriend.com',
    phone: '+91 9876543210',
    address: '123 Pet Resort Lane, Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    latitude: 12.9698,
    longitude: 77.7499,
    description: 'A luxurious and spacious pet resort with indoor and outdoor play areas.',
    dailyPrice: 800,
    availableCapacity: 20,
    maximumCapacity: 20,
    petTypesAccepted: ['Dog', 'Cat'],
    workingHours: { open: '08:00 AM', close: '08:00 PM' },
    facilities: ['AC Rooms', 'Indoor Play', 'Outdoor Play', '24x7 Care', 'CCTV Monitoring'],
    services: ['Day Boarding', 'Night Boarding', 'Long Stay', 'Special Diet']
  },
  {
    name: 'Paws Paradise Boarding',
    email: 'pawsparadise@furryfriend.com',
    phone: '+91 9876543211',
    address: '45 Paws Paradise Street, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    latitude: 12.9784,
    longitude: 77.6408,
    description: 'A cozy home away from home for your beloved pets. Specialized in personalized care.',
    dailyPrice: 650,
    availableCapacity: 10,
    maximumCapacity: 10,
    petTypesAccepted: ['Dog', 'Cat', 'Rabbit'],
    workingHours: { open: '09:00 AM', close: '07:00 PM' },
    facilities: ['Outdoor Play', '24x7 Care', 'Medication Support'],
    services: ['Day Boarding', 'Night Boarding', 'Long Stay', 'Medical Care']
  },
  {
    name: 'Royal Pet Stay',
    email: 'royalpetstay@furryfriend.com',
    phone: '+91 9876543212',
    address: '78 Royal Stay Road, Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    latitude: 12.9279,
    longitude: 77.6271,
    description: 'Premium boarding facility featuring luxury suites and dedicated playtimes.',
    dailyPrice: 1200,
    availableCapacity: 15,
    maximumCapacity: 15,
    petTypesAccepted: ['Dog', 'Cat'],
    workingHours: { open: '07:00 AM', close: '09:00 PM' },
    facilities: ['AC Rooms', 'Indoor Play', 'Outdoor Play', '24x7 Care', 'Emergency Vet', 'Pickup & Drop', 'CCTV Monitoring'],
    services: ['Day Boarding', 'Night Boarding', 'Long Stay', 'Medical Care', 'Senior Pet Care']
  },
  {
    name: 'FurryNest Boarding',
    email: 'furrynest@furryfriend.com',
    phone: '+91 9876543213',
    address: '12 Nesting Ground, HSR Layout',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560102',
    latitude: 12.9121,
    longitude: 77.6446,
    description: 'Specialized boarding for small breeds and cats. Peaceful environment guaranteed.',
    dailyPrice: 500,
    availableCapacity: 30,
    maximumCapacity: 30,
    petTypesAccepted: ['Dog', 'Cat', 'Bird'],
    workingHours: { open: '08:00 AM', close: '06:00 PM' },
    facilities: ['Indoor Play', 'CCTV Monitoring'],
    services: ['Day Boarding', 'Night Boarding']
  },
  {
    name: 'Pet Vacation Home',
    email: 'petvacationhome@furryfriend.com',
    phone: '+91 9876543214',
    address: '90 Vacation Lane, Jayanagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560011',
    latitude: 12.9299,
    longitude: 77.5826,
    description: 'The ultimate vacation destination for your pets while you are on yours. Large open spaces.',
    dailyPrice: 750,
    availableCapacity: 25,
    maximumCapacity: 25,
    petTypesAccepted: ['Dog'],
    workingHours: { open: '08:00 AM', close: '08:00 PM' },
    facilities: ['Outdoor Play', '24x7 Care', 'Pickup & Drop'],
    services: ['Day Boarding', 'Night Boarding', 'Long Stay', 'Training']
  }
];

const seedBoardingCenters = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing boarding centers and associated users
    const existingCenters = await BoardingCenter.find();
    const existingCenterIds = existingCenters.map(c => c._id);
    await User.deleteMany({ boardingCenterId: { $in: existingCenterIds } });
    await BoardingCenter.deleteMany();
    console.log('Cleared existing boarding centers and users.');

    for (const center of centers) {
      // Set image defaults
      center.logo = 'boarding-logo.png';
      center.coverImage = 'boarding-cover.png';
      center.galleryImages = ['boarding-cover.png', 'boarding-cover.png'];
      center.rating = (Math.random() * (5 - 4) + 4).toFixed(1); // 4.0 to 5.0
      center.reviewCount = Math.floor(Math.random() * 50) + 10;
      
      const createdCenter = await BoardingCenter.create(center);

      // Create the user for this boarding center
      await User.create({
        fullName: createdCenter.name,
        email: createdCenter.email,
        password: 'password123',
        phone: createdCenter.phone,
        role: 'boarding',
        isVerified: true,
        boardingCenterId: createdCenter._id
      });
      console.log(`Created Boarding Center & User: ${createdCenter.name}`);
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedBoardingCenters();
