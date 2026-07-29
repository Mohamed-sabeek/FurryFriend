import React from 'react';
import AppointmentCard from './AppointmentCard';

const AppointmentList = ({ appointments = [], emptyMessage = "No appointments found." }) => {
  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center py-16">
        <img src="https://illustrations.popsy.co/amber/taking-notes.svg" alt="Empty" className="w-48 h-48 opacity-60 mb-4" />
        <h3 className="text-xl font-poppins font-bold text-gray-800 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500 max-w-sm">When you book new appointments, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((apt, index) => (
        <AppointmentCard key={apt._id || index} appointment={apt} />
      ))}
    </div>
  );
};

export default AppointmentList;
