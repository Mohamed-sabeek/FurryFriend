export const boardingMockData = {
  stats: {
    upcoming: 1,
    past: 3,
    favorite: 'Cozy Pet Stay'
  },
  hotels: [
    {
      id: 1,
      name: 'Cozy Pet Stay',
      image: 'https://images.unsplash.com/photo-1601758124277-f0086d5eb1da?auto=format&fit=crop&q=80&w=300',
      rating: 4.8,
      reviews: 120,
      distance: '2.5 km',
      pricePerDay: '$45',
      availableRooms: 3,
      amenities: ['AC Rooms', 'CCTV', 'Vet Support']
    },
    {
      id: 2,
      name: 'Happy Tails Boarding',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=300',
      rating: 4.9,
      reviews: 85,
      distance: '4.2 km',
      pricePerDay: '$60',
      availableRooms: 1,
      amenities: ['Outdoor Play', 'Daily Walks', 'Pool']
    },
    {
      id: 3,
      name: 'Paw Paradise Hotel',
      image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=300',
      rating: 4.6,
      reviews: 210,
      distance: '6.0 km',
      pricePerDay: '$35',
      availableRooms: 5,
      amenities: ['Basic Stay', 'Meals Included']
    }
  ],
  upcomingStay: {
    petName: 'Luna',
    hotelName: 'Cozy Pet Stay',
    checkIn: 'Aug 15, 2026',
    checkOut: 'Aug 20, 2026',
    status: 'Confirmed',
    image: 'https://images.unsplash.com/photo-1601758124277-f0086d5eb1da?auto=format&fit=crop&q=80&w=300'
  }
};
