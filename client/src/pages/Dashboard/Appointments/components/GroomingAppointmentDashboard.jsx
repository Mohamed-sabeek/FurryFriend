import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, PawPrint, Scissors,
  Bell, FileText
} from 'lucide-react';
import api from '../../../../utils/axios';
import toast from 'react-hot-toast';

const SPECIES_EMOJI = {
  Dog: '🐶', Cat: '🐱', Bird: '🐦', Rabbit: '🐰',
  Fish: '🐠', Hamster: '🐹', Turtle: '🐢', Other: '🐾'
};

const STATUS_CONFIG = {
  Pending:    { color: 'orange', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  Accepted:   { color: 'blue',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  'In Progress': { color: 'purple', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  Completed:  { color: 'green',  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
  Cancelled:  { color: 'red',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
};

const TIMELINE = ['Pending', 'Accepted', 'In Progress', 'Completed'];
const getTimelineIndex = (status) => {
  return TIMELINE.indexOf(status) !== -1 ? TIMELINE.indexOf(status) : 0;
};

const isWithin24Hours = (dateStr) => {
  const d = new Date(dateStr);
  const diff = d - new Date();
  return diff > 0 && diff < 86400000;
};

const StatCard = ({ label, count, icon: Icon, color }) => (
  <motion.div
    whileHover={{ y: -2 }}
    className={`flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-50`}>
      <Icon size={20} className={`text-${color}-500`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{count}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </motion.div>
);

const GroomingAppointmentCard = ({ appointment, onCancel, onRefresh }) => {
  const pet = appointment.pet || {};
  const petName = pet.petName || 'Your pet';
  const species = pet.species || '';
  const emoji = SPECIES_EMOJI[species] || '🐾';
  const cfg = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.Pending;
  const within24h = isWithin24Hours(appointment.date);
  const centerName = appointment.center?.name || 'Grooming Center';
  const dateStr = new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timelineIdx = getTimelineIndex(appointment.status);

  const handleCancel = async () => {
    if (!window.confirm(`Cancel grooming appointment for ${petName}?`)) return;
    try {
      // Need an endpoint for this in grooming routes, but for now we'll pretend it exists or skip cancellation
      await api.patch(`/grooming/appointments/${appointment._id}/status`, { status: 'Cancelled' });
      toast.success('Appointment cancelled');
      onRefresh();
    } catch {
      toast.error('Failed to cancel (Action not supported yet)');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${cfg.border} relative flex flex-col justify-between`}
    >
      {within24h && appointment.status !== 'Completed' && appointment.status !== 'Cancelled' && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
          <Bell size={14} className="text-amber-500 animate-pulse" />
          <span className="text-xs font-semibold text-amber-700">Reminder — appointment is within 24 hours!</span>
        </div>
      )}
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-2xl shrink-0">
              {pet.profileImage ? (
                <img src={pet.profileImage} alt={petName} className="w-full h-full rounded-2xl object-cover" />
              ) : emoji}
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{petName}</h4>
              <p className="text-xs text-gray-400">{species}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1`}></span>
              {appointment.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
              <Scissors size={13} className="text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">Style</p>
              <p className="font-semibold text-gray-700 text-xs truncate max-w-[120px]">{appointment.recommendedStyle || 'Basic'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <MapPin size={13} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">Center</p>
              <p className="font-semibold text-gray-700 text-xs truncate max-w-[120px]">{centerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
              <Calendar size={13} className="text-green-500" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">Date</p>
              <p className="font-semibold text-gray-700 text-xs">{dateStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
              <Clock size={13} className="text-purple-500" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">Time</p>
              <p className="font-semibold text-gray-700 text-xs">{appointment.time}</p>
            </div>
          </div>
        </div>

        {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
          <div className="mb-4 mt-auto">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-3 right-3 top-3 h-0.5 bg-gray-100 z-0" />
              <div
                className="absolute left-3 top-3 h-0.5 bg-primary z-0 transition-all duration-500"
                style={{ width: `${(timelineIdx / (TIMELINE.length - 1)) * 100}%`, right: 'auto' }}
              />
              {TIMELINE.map((stage, i) => (
                <div key={stage} className="flex flex-col items-center gap-1 z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                    i <= timelineIdx
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    {i <= timelineIdx ? '✓' : i + 1}
                  </div>
                  <p className={`text-[9px] font-medium ${i <= timelineIdx ? 'text-primary' : 'text-gray-400'}`}>{stage}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {appointment.status === 'Completed' && appointment.report && (
          <div className="mb-4 bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2 mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase">Style Completed</span>
              <span className="text-xs font-bold text-gray-800">{appointment.recommendedStyle}</span>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              {appointment.report.servicesPerformed?.length > 0 && (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                   {appointment.report.servicesPerformed.length} Services
                </span>
              )}
              {appointment.report.nextGroomingDate && (
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded ml-auto">
                  📅 Next: {new Date(appointment.report.nextGroomingDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};

const GroomingAppointmentDashboard = ({ refreshTrigger, onFindGroomer }) => {
  const [data, setData] = useState({ stats: {}, upcoming: [], completed: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await api.get('/grooming/appointments/me');
      if (res.data.success) {
        setData({
          stats: res.data.stats || {},
          upcoming: res.data.data?.upcoming || [],
          completed: res.data.data?.completed || [],
          cancelled: res.data.data?.cancelled || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch grooming appointments', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments, refreshTrigger]);

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: data.stats.upcoming || 0 },
    { id: 'completed', label: 'Completed', count: data.stats.completed || 0 },
    { id: 'cancelled', label: 'Cancelled', count: data.stats.cancelled || 0 }
  ];

  const currentList = data[activeTab] || [];

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-poppins font-bold text-gray-800 text-xl">Grooming Appointments</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track your pet's spa days and grooming history.</p>
        </div>
        <button
          onClick={fetchAppointments}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-600 font-medium hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
            <StatCard label="Upcoming" count={data.stats.upcoming || 0} icon={Calendar} color="blue" />
            <StatCard label="Pending" count={data.stats.pending || 0} icon={Clock} color="orange" />
            <StatCard label="Completed" count={data.stats.completed || 0} icon={CheckCircle2} color="green" />
            <StatCard label="Cancelled" count={data.stats.cancelled || 0} icon={XCircle} color="red" />
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {currentList.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center"
              >
                <Scissors size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="font-bold text-gray-400 text-lg">No {activeTab} grooming appointments</p>
                <p className="text-sm text-gray-400 mt-1 mb-6">
                  {activeTab === 'upcoming' ? 'Use GroomEase AI to find a recommended grooming center.' : `No ${activeTab} appointments yet.`}
                </p>
                {activeTab === 'upcoming' && (
                  <button
                    onClick={onFindGroomer}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors"
                  >
                    Open GroomEase AI
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch"
              >
                {currentList.map((appt) => (
                  <GroomingAppointmentCard
                    key={appt._id}
                    appointment={appt}
                    onRefresh={fetchAppointments}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default GroomingAppointmentDashboard;
