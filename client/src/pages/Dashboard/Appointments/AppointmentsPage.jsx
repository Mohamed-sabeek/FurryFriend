import React, { useState } from 'react';
import AppointmentDashboard from './components/AppointmentDashboard';
import { useNavigate } from 'react-router-dom';

const AppointmentsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-800">My Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your upcoming veterinary visits and history</p>
        </div>
      </div>
      
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 min-h-[60vh]">
        <AppointmentDashboard 
          refreshTrigger={refreshTrigger}
          onFindVet={() => navigate('/dashboard/ai')}
        />
      </div>
    </div>
  );
};

export default AppointmentsPage;
