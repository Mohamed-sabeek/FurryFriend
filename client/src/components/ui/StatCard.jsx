import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
  const colorMap = {
    primary: 'bg-red-50 text-primary border-red-100',
    blue: 'bg-blue-50 text-blue-500 border-blue-100',
    green: 'bg-green-50 text-green-500 border-green-100',
    purple: 'bg-purple-50 text-purple-500 border-purple-100',
    orange: 'bg-orange-50 text-orange-500 border-orange-100',
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl border ${selectedColor} group-hover:scale-110 transition-transform`}>
          {Icon && <Icon size={24} />}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h4 className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h4>
      <h3 className="text-3xl font-black text-gray-800">{value}</h3>
    </motion.div>
  );
};

export default StatCard;
