import React, { useState } from 'react';
import { Home, Calendar, MapPin, Search, Check, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeader from '../../../components/ui/SectionHeader';
import StatCard from '../../../components/ui/StatCard';
import SummaryCard from '../../../components/ui/SummaryCard';
import { boardingMockData } from './mockData';

const BoardingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const data = boardingMockData;

  const filteredHotels = data.hotels.filter(hotel => 
    hotel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader 
        title="Boarding & Daycare" 
        subtitle="Find the perfect stay for your furry friend while you're away."
        icon={Home}
        onSearch={setSearchQuery}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Upcoming Stays" 
          value={data.stats.upcoming} 
          icon={Calendar} 
          color="blue"
        />
        <StatCard 
          title="Past Boardings" 
          value={data.stats.past} 
          icon={Home} 
          color="green"
        />
        <StatCard 
          title="Favorite Center" 
          value={data.stats.favorite} 
          icon={MapPin} 
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Available Boarding Centers</h2>
          </div>
          
          <div className="space-y-6">
            {filteredHotels.map((hotel, idx) => (
              <motion.div 
                key={hotel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col sm:flex-row group"
              >
                <div className="sm:w-1/3 h-48 sm:h-auto relative overflow-hidden">
                  <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg font-bold text-gray-800 text-xs shadow-sm flex items-center gap-1">
                    ⭐ {hotel.rating} ({hotel.reviews})
                  </div>
                </div>
                
                <div className="p-6 sm:w-2/3 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-xl mb-1">{hotel.name}</h3>
                      <p className="text-sm text-gray-500 font-medium flex items-center gap-1">
                        <MapPin size={14} /> {hotel.distance} away
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gray-800">{hotel.pricePerDay}</span>
                      <span className="text-xs text-gray-500 block">/ day</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {hotel.amenities.map(amenity => (
                      <span key={amenity} className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                        <Check size={12} /> {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between">
                    <span className={`text-sm font-bold ${hotel.availableRooms > 2 ? 'text-green-600' : 'text-orange-600'}`}>
                      {hotel.availableRooms} rooms available
                    </span>
                    <div className="flex gap-3">
                      <button className="px-5 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors">
                        Details
                      </button>
                      <button className="px-5 py-2 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <SummaryCard title="Upcoming Stay" icon={Calendar} className="sticky top-6 bg-gradient-to-br from-white to-orange-50/50">
            {data.upcomingStay ? (
              <div className="mt-2">
                <div className="h-32 rounded-2xl overflow-hidden mb-4 border border-gray-100 shadow-sm relative">
                  <img src={data.upcomingStay.image} className="w-full h-full object-cover" alt="Hotel" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-white font-bold text-lg">{data.upcomingStay.hotelName}</h3>
                  </div>
                </div>
                
                <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Guest</span>
                    <span className="font-bold text-gray-800 flex items-center gap-2">🐶 {data.upcomingStay.petName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Check In</span>
                    <span className="font-bold text-gray-800">{data.upcomingStay.checkIn}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500">Check Out</span>
                    <span className="font-bold text-gray-800">{data.upcomingStay.checkOut}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className="font-bold text-green-700 bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                      {data.upcomingStay.status}
                    </span>
                  </div>
                </div>
                
                <button className="w-full mt-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors flex justify-center items-center gap-2">
                  View Booking <ChevronRight size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No upcoming stays scheduled.</p>
              </div>
            )}
          </SummaryCard>
        </div>
      </div>
    </div>
  );
};

export default BoardingPage;
