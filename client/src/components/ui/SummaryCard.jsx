import React from 'react';
import { motion } from 'framer-motion';

const SummaryCard = ({ title, subtitle, icon: Icon, children, className = '' }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 ${className}`}
    >
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
            <Icon size={24} />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      
      <div>
        {children}
      </div>
    </motion.div>
  );
};

export default SummaryCard;
