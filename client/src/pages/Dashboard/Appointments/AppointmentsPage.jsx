import React, { useState } from 'react';
import AppointmentDashboard from './components/AppointmentDashboard';
import GroomingAppointmentDashboard from './components/GroomingAppointmentDashboard';
import BoardingAppointmentDashboard from './components/BoardingAppointmentDashboard';
import { useNavigate } from 'react-router-dom';

const AppointmentsPage = () => {
  const [activeMainTab, setActiveMainTab] = useState('veterinary');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit mb-4">
        <button
          onClick={() => setActiveMainTab('veterinary')}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeMainTab === 'veterinary' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Veterinary
        </button>
        <button
          onClick={() => setActiveMainTab('grooming')}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeMainTab === 'grooming' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Grooming
        </button>
        <button
          onClick={() => setActiveMainTab('boarding')}
          className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
            activeMainTab === 'boarding' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Boarding
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 min-h-[60vh]">
        {activeMainTab === 'veterinary' && (
          <AppointmentDashboard 
            refreshTrigger={refreshTrigger}
            onFindVet={() => navigate('/dashboard/ai')}
          />
        )}
        {activeMainTab === 'grooming' && (
          <GroomingAppointmentDashboard 
            refreshTrigger={refreshTrigger}
            onFindGroomer={() => navigate('/dashboard/groomsense')}
          />
        )}
        {activeMainTab === 'boarding' && (
          <BoardingAppointmentDashboard 
            refreshTrigger={refreshTrigger}
            onFindBoarding={() => navigate('/dashboard/boarding')}
          />
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
