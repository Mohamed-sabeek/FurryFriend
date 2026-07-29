import React, { useEffect, useState } from 'react';
import { CalendarCheck, Clock, CheckCircle2, XCircle, Users, Activity } from 'lucide-react';
import api from '../../utils/axios';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const ClinicDashboard = () => {
  const [data, setData] = useState({
    todayPatients: 0,
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0,
    recentAppointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/clinic/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-500 text-sm font-semibold mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
      </div>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center ${bgColorClass}`}>
        <Icon className={colorClass} size={28} />
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-gray-500 text-center py-20 font-semibold">Loading Dashboard...</div>;
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Clinic Overview</h1>
        <p className="text-gray-500 mt-1">Here's what's happening at your clinic today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Today's Patients" value={data.todayPatients} icon={Users} colorClass="text-blue-600" bgColorClass="bg-blue-50" />
        <StatCard title="Pending" value={data.pending} icon={Clock} colorClass="text-amber-600" bgColorClass="bg-amber-50" />
        <StatCard title="Accepted" value={data.accepted} icon={CalendarCheck} colorClass="text-indigo-600" bgColorClass="bg-indigo-50" />
        <StatCard title="Completed" value={data.completed} icon={CheckCircle2} colorClass="text-emerald-600" bgColorClass="bg-emerald-50" />
        <StatCard title="Rejected" value={data.rejected} icon={XCircle} colorClass="text-red-600" bgColorClass="bg-red-50" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-primary" size={20} /> Recent Appointments
          </h2>
          <Link to="/clinic/appointments" className="text-sm font-bold text-primary hover:text-primary-hover bg-primary/5 px-4 py-2 rounded-xl transition-colors">View All</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {data.recentAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarCheck size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No appointments available.</p>
            </div>
          ) : (
            data.recentAppointments.map((appt) => (
              <div key={appt._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={appt.pet?.profileImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${appt.pet?.name}`}
                    alt={appt.pet?.name}
                    className="w-12 h-12 rounded-full object-cover bg-gray-100 border border-gray-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {appt.pet?.name} <span className="text-gray-400 font-medium text-sm ml-1">({appt.pet?.species} • {appt.pet?.breed})</span>
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      Owner: <span className="text-gray-700">{appt.user?.fullName}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {format(new Date(appt.date), 'MMM dd, yyyy')} at {appt.time} • <span className="text-gray-700 font-medium">{appt.reason || appt.type}</span>
                    </p>
                  </div>
                </div>
                <div className="shrink-0 sm:ml-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    appt.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    (appt.status === 'Accepted' || appt.status === 'Confirmed') ? 'bg-indigo-100 text-indigo-700' :
                    appt.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicDashboard;
