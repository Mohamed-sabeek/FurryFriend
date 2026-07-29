export const groomingMockData = {
  stats: {
    upcoming: 1,
    completed: 4,
    favorite: 'Happy Paws Spa'
  },
  services: [
    {
      id: 1,
      title: 'Full Bath & Dry',
      image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=200',
      duration: '45 mins',
      price: '$35.00',
      rating: 4.8
    },
    {
      id: 2,
      title: 'Hair Cut & Styling',
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=200',
      duration: '60 mins',
      price: '$55.00',
      rating: 4.9
    },
    {
      id: 3,
      title: 'Nail Trimming',
      image: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=200',
      duration: '15 mins',
      price: '$15.00',
      rating: 4.7
    },
    {
      id: 4,
      title: 'Luxury Pet Spa',
      image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=200',
      duration: '90 mins',
      price: '$85.00',
      rating: 5.0
    }
  ],
  nearbyGroomers: [
    {
      id: 1,
      name: 'Happy Paws Spa',
      distance: '2.4 km',
      rating: 4.8,
      address: '123 Pet Avenue, NY'
    },
    {
      id: 2,
      name: 'PetCare Grooming',
      distance: '3.1 km',
      rating: 4.6,
      address: '45 Bark Street, NY'
    },
    {
      id: 3,
      name: 'Woof Salon',
      distance: '5.0 km',
      rating: 4.9,
      address: '78 Meow Lane, NY'
    }
  ],
  history: [
    {
      id: 1,
      date: '2026-07-15T10:00:00Z',
      service: 'Full Bath & Dry',
      groomer: 'Happy Paws Spa',
      status: 'Completed'
    },
    {
      id: 2,
      date: '2026-06-02T14:30:00Z',
      service: 'Hair Cut & Styling',
      groomer: 'PetCare Grooming',
      status: 'Completed'
    },
    {
      id: 3,
      date: '2026-08-05T09:00:00Z',
      service: 'Nail Trimming',
      groomer: 'Happy Paws Spa',
      status: 'Upcoming'
    }
  ]
};
