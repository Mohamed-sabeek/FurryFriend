require('dotenv').config();
const mongoose = require('mongoose');
const Clinic = require('./models/Clinic');

const seedClinics = [
  {
    name: "SKS Veterinary Hospital",
    address: "5th Street, Bharathi Colony Road, Lal Bahadur Colony, Peelamedu, Coimbatore - 641004",
    city: "Coimbatore",
    latitude: 11.0269,
    longitude: 77.0016,
    phone: "8680070014",
    rating: 4.8,
    isOpen: true,
    openingHours: "9:00 AM - 9:00 PM",
    image: "https://images.unsplash.com/photo-1599443015574-be5fe8c057f4?auto=format&fit=crop&q=80&w=400",
    availableSlots: ["10:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "06:00 PM"],
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  },
  {
    name: "Cotton City Pets Clinic",
    address: "New No 179/4 Old No 182-183, Alagesan Road, Saibaba Colony, Coimbatore - 641011",
    city: "Coimbatore",
    latitude: 11.0253,
    longitude: 76.9472,
    phone: "9443159045",
    rating: 4.6,
    isOpen: true,
    openingHours: "10:00 AM - 8:00 PM",
    image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400",
    availableSlots: ["10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM"],
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  },
  {
    name: "Veterinary Poly Clinic",
    address: "Ismail Rowther Street, Union High School Road, Coimbatore Ho, Coimbatore - 641001",
    city: "Coimbatore",
    latitude: 10.9984,
    longitude: 76.9621,
    phone: "0422-2397614",
    rating: 4.3,
    isOpen: true,
    openingHours: "8:00 AM - 7:00 PM",
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cbcb8122?auto=format&fit=crop&q=80&w=400",
    availableSlots: ["09:00 AM", "11:00 AM", "12:30 PM", "02:00 PM", "04:00 PM"],
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  },
  {
    name: "A To Z Pet Polyclinic",
    address: "No 26/30, Avinashi Road, Behind Radhakrishnana Mill, Peelamedu, Coimbatore - 641004",
    city: "Coimbatore",
    latitude: 11.0264,
    longitude: 77.0003,
    phone: "9360148555",
    rating: 4.7,
    isOpen: true,
    openingHours: "9:30 AM - 8:30 PM",
    image: "https://images.unsplash.com/photo-1596272875886-f6313ed6c99f?auto=format&fit=crop&q=80&w=400",
    availableSlots: ["10:00 AM", "12:00 PM", "03:00 PM", "05:30 PM"],
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  },
  {
    name: "Lifecare Pet Specialty Clinic",
    address: "Thudiyalur, Coimbatore - 641034",
    city: "Coimbatore",
    latitude: 11.0772,
    longitude: 76.9427,
    phone: "9342893438",
    rating: 4.9,
    isOpen: true,
    openingHours: "24 Hours",
    image: "https://images.unsplash.com/photo-1584819766446-243ce4465593?auto=format&fit=crop&q=80&w=400",
    availableSlots: ["09:00 AM", "01:00 PM", "04:00 PM", "08:00 PM", "11:00 PM"],
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  }
];

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected.');

    // Optional: Delete existing
    await Clinic.deleteMany({});
    console.log('Cleared existing clinics.');

    const created = await Clinic.create(seedClinics);
    console.log(`Successfully seeded ${created.length} clinics.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding clinics:', err);
    process.exit(1);
  }
};

runSeed();
