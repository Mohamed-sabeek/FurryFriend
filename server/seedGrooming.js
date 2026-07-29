const mongoose = require('mongoose');
const dotenv = require('dotenv');
const GroomingCenter = require('./models/GroomingCenter');

dotenv.config();

const mockGroomingCenters = [
  {
    name: 'Happy Paws Grooming Studio',
    address: '123 Pet Street, Koramangala',
    city: 'Bengaluru',
    latitude: 12.9352,
    longitude: 77.6245,
    phone: '9876543210',
    rating: 4.8,
    openingHours: '10:00 AM - 8:00 PM',
    services: ['Bath & Brush', 'Full Grooming', 'Nail Trimming', 'Ear Cleaning', 'Teeth Brushing', 'Deshedding', 'Medicated Bath'],
    petTypes: ['Dog', 'Cat'],
    priceRange: '$$',
    images: ['https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800&auto=format&fit=crop'],
    description: 'A premium grooming studio dedicated to providing stress-free and hygienic grooming for your pets.',
    pickupAvailable: true,
    emergencyGrooming: false,
    supportedBreeds: ['All Breeds']
  },
  {
    name: 'Purrfect Style Salon',
    address: '45 Feline Avenue, Indiranagar',
    city: 'Bengaluru',
    latitude: 12.9784,
    longitude: 77.6408,
    phone: '9876543211',
    rating: 4.9,
    openingHours: '11:00 AM - 9:00 PM',
    services: ['Bath & Brush', 'Lion Cut', 'Nail Trimming', 'Ear Cleaning', 'Mat Removal', 'Waterless Grooming'],
    petTypes: ['Cat'],
    priceRange: '$$$',
    images: ['https://images.unsplash.com/photo-1595295326620-80415a7cf308?q=80&w=800&auto=format&fit=crop'],
    description: 'Specialized luxury salon strictly for cats, featuring feline-friendly quiet environments.',
    pickupAvailable: false,
    emergencyGrooming: true,
    supportedBreeds: ['Persian', 'Maine Coon', 'British Shorthair', 'All Breeds']
  },
  {
    name: 'Canine Care Hub',
    address: '88 Bark Lane, Jayanagar',
    city: 'Bengaluru',
    latitude: 12.9299,
    longitude: 77.5824,
    phone: '9876543212',
    rating: 4.6,
    openingHours: '9:00 AM - 7:00 PM',
    services: ['Full Grooming', 'Puppy Cut', 'Teddy Cut', 'Nail Trimming', 'Anal Gland Expression'],
    petTypes: ['Dog'],
    priceRange: '$$',
    images: ['https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=800&auto=format&fit=crop'],
    description: 'Expert canine groomers skilled in breed-specific haircuts and sensitive skin treatments.',
    pickupAvailable: true,
    emergencyGrooming: false,
    supportedBreeds: ['Shih Tzu', 'Poodle', 'Golden Retriever', 'German Shepherd']
  },
  {
    name: 'Wags & Whiskers Spa',
    address: '12 Luxury Drive, Whitefield',
    city: 'Bengaluru',
    latitude: 12.9698,
    longitude: 77.7499,
    phone: '9876543213',
    rating: 4.9,
    openingHours: '10:00 AM - 10:00 PM',
    services: ['Luxury Spa Bath', 'Aromatherapy', 'Blueberry Facial', 'Full Grooming', 'Deshedding', 'Tick & Flea Treatment'],
    petTypes: ['Dog', 'Cat'],
    priceRange: '$$$$',
    images: ['https://images.unsplash.com/photo-1542289669-e700a0684fb6?q=80&w=800&auto=format&fit=crop'],
    description: 'The ultimate luxury spa experience for your furry friend, including aromatherapy and mud baths.',
    pickupAvailable: true,
    emergencyGrooming: true,
    supportedBreeds: ['All Breeds']
  },
  {
    name: 'The Grooming Van (Mobile)',
    address: 'Serves all across Bengaluru',
    city: 'Bengaluru',
    latitude: 12.9716,
    longitude: 77.5946,
    phone: '9876543214',
    rating: 4.7,
    openingHours: '8:00 AM - 8:00 PM',
    services: ['Basic Bath & Brush', 'Full Grooming', 'Nail Trimming', 'Ear Cleaning', 'Tick & Flea Treatment'],
    petTypes: ['Dog', 'Cat'],
    priceRange: '$$$',
    images: ['https://images.unsplash.com/photo-1629898086036-7c6de4bb178d?q=80&w=800&auto=format&fit=crop'],
    description: 'We bring the salon to your doorstep! fully equipped AC mobile grooming van.',
    pickupAvailable: false,
    emergencyGrooming: false,
    supportedBreeds: ['All Breeds']
  },
  {
    name: 'Gentle Paws Clinic & Grooming',
    address: '40 Vet Road, HSR Layout',
    city: 'Bengaluru',
    latitude: 12.9121,
    longitude: 77.6446,
    phone: '9876543215',
    rating: 4.5,
    openingHours: '10:00 AM - 6:00 PM',
    services: ['Medicated Bath', 'Nail Trimming', 'Ear Cleaning', 'Tick & Flea Treatment', 'Mat Removal', 'Anal Gland Expression'],
    petTypes: ['Dog', 'Cat'],
    priceRange: '$$',
    images: ['https://images.unsplash.com/photo-1601758123927-4f7acb3d2bbf?q=80&w=800&auto=format&fit=crop'],
    description: 'Veterinary supervised grooming focusing on skin conditions and anxious pets.',
    pickupAvailable: false,
    emergencyGrooming: true,
    supportedBreeds: ['All Breeds']
  },
  {
    name: 'Bubbles & Bows',
    address: '55 Park Street, Malleshwaram',
    city: 'Bengaluru',
    latitude: 13.0031,
    longitude: 77.5701,
    phone: '9876543216',
    rating: 4.4,
    openingHours: '10:30 AM - 7:30 PM',
    services: ['Bath & Brush', 'Nail Trimming', 'Show Dog Styling', 'Puppy Cut', 'Hair Coloring (Safe)'],
    petTypes: ['Dog'],
    priceRange: '$$$',
    images: ['https://images.unsplash.com/photo-1591160690555-5debfba289f0?q=80&w=800&auto=format&fit=crop'],
    description: 'Trendy styling and show-dog preparation experts.',
    pickupAvailable: false,
    emergencyGrooming: false,
    supportedBreeds: ['Poodle', 'Shih Tzu', 'Bichon Frise', 'Maltese']
  },
  {
    name: 'Muddy Paws Wash Station',
    address: '12 Ring Road, JP Nagar',
    city: 'Bengaluru',
    latitude: 12.9063,
    longitude: 77.5857,
    phone: '9876543217',
    rating: 4.2,
    openingHours: '9:00 AM - 9:00 PM',
    services: ['Bath & Brush', 'Deshedding', 'Tick & Flea Treatment'],
    petTypes: ['Dog'],
    priceRange: '$',
    images: ['https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?q=80&w=800&auto=format&fit=crop'],
    description: 'Quick, affordable and thorough wash and dry services for active dogs.',
    pickupAvailable: false,
    emergencyGrooming: false,
    supportedBreeds: ['Labrador Retriever', 'Golden Retriever', 'Husky', 'German Shepherd', 'Beagle']
  }
];

const seedGrooming = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGO_URI is missing in .env');
      process.exit(1);
    }
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected for Seeding Grooming Centers...');

    await GroomingCenter.deleteMany();
    console.log('Cleared existing grooming centers.');

    await GroomingCenter.insertMany(mockGroomingCenters);
    
    console.log(`Successfully seeded ${mockGroomingCenters.length} grooming centers.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedGrooming();
