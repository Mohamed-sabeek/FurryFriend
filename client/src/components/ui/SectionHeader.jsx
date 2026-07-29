import React from 'react';
import { Search } from 'lucide-react';

const SectionHeader = ({ title, subtitle, icon: Icon, onSearch }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-text-heading flex items-center gap-2 mb-2">
          {title} {Icon && <Icon className="text-primary" size={28} />}
        </h1>
        {subtitle && <p className="text-gray-500 font-medium">{subtitle}</p>}
      </div>

      {onSearch && (
        <div className="relative w-full sm:w-auto">
          <input 
            type="text" 
            placeholder="Search..." 
            onChange={(e) => onSearch(e.target.value)}
            className="w-full sm:w-72 pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
