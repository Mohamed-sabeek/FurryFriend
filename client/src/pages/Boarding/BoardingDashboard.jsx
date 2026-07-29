import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, CheckCircle, Clock, CheckSquare, Activity, User, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/axios';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between"
  >
    <div>
      <p className="text-gray-500 font-medium text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-50`}>
      <Icon className={`text-${color}-500`} size={28} />
    </div>
  </motion.div>
);

const BoardingDashboard = () => {
  const [stats, setStats] = useState({
    todayCheckIns: 0,
    todayCheckOuts: 0,
    pending: 0,
    accepted: 0,
    checkedIn: 0,
    completed: 0,
    cancelled: 0,
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/boarding/center/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching center stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1 text-sm">Welcome back! Here's what's happening at your boarding center today.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Check-ins"
            value={stats.todayCheckIns}
            icon={Calendar}
            color="blue"
            delay={0.1}
          />
          <StatCard
            title="Today's Check-outs"
            value={stats.todayCheckOuts}
            icon={Calendar}
            color="orange"
            delay={0.15}
          />
          <StatCard
            title="Pending Requests"
            value={stats.pending}
            icon={Clock}
            color="yellow"
            delay={0.2}
          />
          <StatCard
            title="Accepted"
            value={stats.accepted}
            icon={CheckSquare}
            color="indigo"
            delay={0.25}
          />
          <StatCard
            title="Currently Boarding"
            value={stats.checkedIn}
            icon={Users}
            color="purple"
            delay={0.3}
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            color="green"
            delay={0.35}
          />
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="text-primary" size={20} /> Recent Bookings
            </h2>
            <Link to="/boarding/appointments" className="text-sm font-bold text-primary hover:text-primary-hover bg-primary/5 px-4 py-2 rounded-xl transition-colors">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {!stats.recentBookings || stats.recentBookings.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No recent bookings available.</p>
              </div>
            ) : (
              stats.recentBookings.map((appt) => (
                <div key={appt._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between group gap-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={(appt.pet?.profileImage && appt.pet.profileImage !== 'default.jpg') 
                        ? (appt.pet.profileImage.startsWith('http') ? appt.pet.profileImage : `http://localhost:5000/uploads/${appt.pet.profileImage}`)
                        : `https://api.dicebear.com/7.x/shapes/svg?seed=${appt.pet?.petName || 'pet'}`
                      }
                      alt={appt.pet?.petName || 'Pet'}
                      className="w-14 h-14 rounded-full object-cover bg-primary/5 border border-gray-100 shadow-sm shrink-0"
                      onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=fallback` }}
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {appt.pet?.petName} <span className="text-gray-400 font-medium text-sm ml-1">({appt.pet?.breed || appt.pet?.species})</span>
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-1">
                        <User size={12} /> {appt.user?.fullName} | <Phone size={12} /> {appt.user?.phone || 'No Phone'}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5 font-medium flex items-center gap-2">
                        <span>Check In: {new Date(appt.checkInDate).toLocaleDateString('en-GB')}</span>
                        <span>•</span>
                        <span>Check Out: {new Date(appt.checkOutDate).toLocaleDateString('en-GB')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 sm:ml-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      appt.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      (appt.status === 'Accepted' || appt.status === 'Checked In') ? 'bg-indigo-100 text-indigo-700' :
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
      )}
    </div>
  );
};

export default BoardingDashboard;
