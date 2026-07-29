import React from 'react';
import { Star, Clock, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceCard = ({ image, title, provider, rating, distance, price, duration, onBook }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group flex flex-col h-full"
    >
      {image && (
        <div className="h-40 w-full bg-gray-100 relative overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {price && (
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl font-bold text-gray-800 shadow-sm text-sm">
              {price}
            </div>
          )}
        </div>
      )}
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-1">{title}</h3>
          {rating && (
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-lg text-xs font-bold">
              <Star size={12} className="fill-yellow-500 text-yellow-500" />
              {rating}
            </div>
          )}
        </div>
        
        {provider && <p className="text-sm text-gray-500 font-medium mb-3">{provider}</p>}
        
        <div className="flex flex-wrap gap-3 mb-4 mt-auto">
          {duration && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
              <Clock size={14} className="text-gray-400" /> {duration}
            </div>
          )}
          {distance && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
              <MapPin size={14} className="text-gray-400" /> {distance}
            </div>
          )}
        </div>

        <button 
          onClick={onBook}
          className="w-full py-2.5 bg-gray-50 hover:bg-primary hover:text-white text-gray-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 group/btn"
        >
          Book Now
          <ChevronRight size={16} className="text-gray-400 group-hover/btn:text-white transition-colors" />
        </button>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
