import React from 'react';

const HeroHeader = ({ onBookAppointment }) => {
  return (
    <div className="mb-3 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-3 shrink-0">
      <div>
        <h1 className="text-3xl font-poppins font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">VetConnect AI</span>
        </h1>
        <p className="text-gray-500 font-medium text-sm mt-1">24/7 intelligent pet care assistance</p>
      </div>
      <button 
        onClick={onBookAppointment}
        className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark transition-colors shadow-sm"
      >
        Need Appointment
      </button>
    </div>
  );
};

export default HeroHeader;
