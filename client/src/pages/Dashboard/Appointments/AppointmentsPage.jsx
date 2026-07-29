import React, { useState } from 'react';
import AppointmentDashboard from './components/AppointmentDashboard';
import { useNavigate } from 'react-router-dom';

const AppointmentsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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
