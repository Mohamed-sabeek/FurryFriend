import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, CheckCircle, Clock } from 'lucide-react';
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

const GroomingDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/grooming/center/stats');
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
          <p className="text-gray-500 mt-1 text-sm">Welcome back! Here's what's happening at your grooming center today.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Appointments"
            value={stats.todayAppointments}
            icon={Calendar}
            color="blue"
            delay={0.1}
          />
          <StatCard
            title="Pending Requests"
            value={stats.pendingAppointments}
            icon={Clock}
            color="orange"
            delay={0.2}
          />
          <StatCard
            title="Completed"
            value={stats.completedAppointments}
            icon={CheckCircle}
            color="green"
            delay={0.3}
          />
          <StatCard
            title="Total Clients"
            value="--"
            icon={Users}
            color="purple"
            delay={0.4}
          />
        </div>
      )}

      {/* Add more widgets as needed later (like Recent Appointments list) */}
    </div>
  );
};

export default GroomingDashboard;
