import React from 'react';
import { Scissors, Calendar, Heart, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeader from '../../../components/ui/SectionHeader';
import StatCard from '../../../components/ui/StatCard';
import SummaryCard from '../../../components/ui/SummaryCard';
import ServiceCard from '../../../components/ui/ServiceCard';
import { groomingMockData } from './mockData';

const GroomingPage = () => {
  const data = groomingMockData;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader 
        title="Grooming" 
        subtitle="Book professional grooming services for your pets."
        icon={Scissors}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Upcoming Sessions" 
          value={data.stats.upcoming} 
          icon={Calendar} 
          color="blue"
        />
        <StatCard 
          title="Completed Sessions" 
          value={data.stats.completed} 
          icon={Scissors} 
          color="green"
        />
        <StatCard 
          title="Favorite Groomer" 
          value={data.stats.favorite} 
          icon={Heart} 
          color="primary"
        />
      </div>

      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Popular Services</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.services.map(service => (
            <ServiceCard 
              key={service.id}
              image={service.image}
              title={service.title}
              duration={service.duration}
              price={service.price}
              rating={service.rating}
              onBook={() => {}}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SummaryCard title="Nearby Groomers" icon={MapPin}>
            <div className="space-y-4">
              {data.nearbyGroomers.map(groomer => (
                <div key={groomer.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 hover:bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="mb-3 sm:mb-0">
                    <h3 className="font-bold text-gray-800 text-lg">{groomer.name}</h3>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {groomer.distance} • {groomer.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-xl text-sm font-bold flex items-center gap-1 border border-yellow-100">
                      ⭐ {groomer.rating}
                    </div>
                    <button className="bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-white hover:border-primary font-bold px-5 py-2 rounded-xl transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SummaryCard>
        </div>

        <div className="lg:col-span-1">
          <SummaryCard title="Grooming History" icon={Clock} className="h-full">
            <div className="relative border-l-2 border-red-100 ml-4 space-y-6 py-2 mt-4">
              {data.history.map((record, idx) => (
                <motion.div 
                  key={record.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-6"
                >
                  <div className="absolute -left-[13px] top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm bg-blue-100">
                    <Scissors size={12} className="text-blue-500" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <span className="text-xs font-bold text-gray-400 mb-1 block">
                      {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h4 className="font-bold text-gray-800">{record.service}</h4>
                    <p className="text-sm text-gray-500">{record.groomer}</p>
                    <span className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      record.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      {record.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </SummaryCard>
        </div>
      </div>
    </div>
  );
};

export default GroomingPage;
