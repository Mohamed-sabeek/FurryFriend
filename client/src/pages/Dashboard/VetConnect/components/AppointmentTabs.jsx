import React from 'react';

const tabs = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'vaccinations', label: 'Vaccinations' }
];

const AppointmentTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 border-b border-gray-200 pb-px">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-300 relative ${
            activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default AppointmentTabs;
