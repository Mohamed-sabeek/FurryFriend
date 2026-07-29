import React from 'react';
import { MapPin, Navigation2, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const MapPlaceholder = ({ hospitals = [] }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-6">
      {/* Map Area */}
      <div className="flex-1 h-64 md:h-auto bg-blue-50 rounded-2xl border border-blue-100 relative overflow-hidden flex items-center justify-center">
        {/* Decorative Map Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute w-full h-full flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-white rounded-full shadow-lg mx-auto flex items-center justify-center text-primary mb-3">
            <MapPin size={32} />
          </div>
          <p className="font-poppins font-bold text-gray-800">Interactive Map</p>
          <p className="text-sm text-gray-500">Live locations coming soon.</p>
        </div>
      </div>

      {/* Hospitals List */}
      <div className="md:w-80 shrink-0 flex flex-col">
        <h3 className="text-lg font-poppins font-bold text-gray-800 mb-4">Nearby Hospitals</h3>
        
        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-80">
          {hospitals.map((hospital, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-800 text-sm">{hospital.name}</h4>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${hospital.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {hospital.open ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1"><Navigation2 size={12} className="text-primary" /> {hospital.distance}</span>
                <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400" /> {hospital.rating}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapPlaceholder;
