import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Phone, AlertTriangle, CheckCircle2,
  XCircle, RefreshCw, ChevronRight, Navigation2, Video,
  Home, Star, PawPrint, Bell, X, Stethoscope, Plus
} from 'lucide-react';
import api from '../../../../utils/axios';
import toast from 'react-hot-toast';
import MedicalVisitModal from './MedicalVisitModal';

// ─── Species emoji map ────────────────────────────────────────────────────────
const SPECIES_EMOJI = {
  Dog: '🐶', Cat: '🐱', Bird: '🐦', Rabbit: '🐰',
  Fish: '🐠', Hamster: '🐹', Turtle: '🐢', Other: '🐾'
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Upcoming:   { color: 'blue',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  Confirmed:  { color: 'blue',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  Pending:    { color: 'orange', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  Completed:  { color: 'green',  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500'  },
  Cancelled:  { color: 'red',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
  'Checked In': { color: 'purple', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' }
};

// ─── Timeline stages ──────────────────────────────────────────────────────────
const TIMELINE = ['Booked', 'Confirmed', 'Reminder Sent', 'Completed'];
const getTimelineIndex = (status) => {
  if (status === 'Pending') return 0;
  if (status === 'Confirmed' || status === 'Checked In') return 2;
  if (status === 'Completed') return 3;
  return 0;
};

// ─── Is within 24 hours ───────────────────────────────────────────────────────
const isWithin24Hours = (dateStr) => {
  const d = new Date(dateStr);
  const diff = d - new Date();
  return diff > 0 && diff < 86400000;
};

// ─── Stats Card ───────────────────────────────────────────────────────────────
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

// ─── Appointment Card ─────────────────────────────────────────────────────────
const AppointmentCard = ({ appointment, onCancel, onRefresh, onAddVisit }) => {
  const pet = appointment.pet || {};
  const petName = pet.petName || appointment.petName || 'Your pet';
  const species = pet.species || '';
  const emoji = SPECIES_EMOJI[species] || '🐾';
  const cfg = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.Pending;
  const within24h = isWithin24Hours(appointment.date);
  const hospitalName = appointment.hospitalName || appointment.notes?.replace('Booked via VetConnect AI. Hospital: ', '') || 'Clinic';
  const dateStr = new Date(appointment.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timelineIdx = getTimelineIndex(appointment.status);

  const handleCancel = async () => {
    if (!window.confirm(`Cancel appointment for ${petName}?`)) return;
    try {
      await api.patch(`/vet/appointments/${appointment._id}/cancel`);
      toast.success('Appointment cancelled');
      onRefresh();
    } catch {
      toast.error('Failed to cancel');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${cfg.border} relative`}
    >
      {/* Reminder strip */}
      {within24h && appointment.status !== 'Completed' && appointment.status !== 'Cancelled' && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2">
          <Bell size={14} className="text-amber-500 animate-pulse" />
          <span className="text-xs font-semibold text-amber-700">Reminder — appointment is within 24 hours!</span>
        </div>
      )}
      
      {/* Missing Visit Details Warning Strip */}
      {appointment.status === 'Completed' && !appointment.hasVisitDetails && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center gap-2">
          <AlertTriangle size={14} className="text-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary">Please add visit details to update health records.</span>
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
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
            {appointment.isEmergency && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">🚨 Emergency</span>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
              <Stethoscope size={13} className="text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">Type</p>
              <p className="font-semibold text-gray-700 text-xs">{appointment.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <MapPin size={13} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[11px] text-gray-400">Hospital</p>
              <p className="font-semibold text-gray-700 text-xs truncate max-w-[100px]">{hospitalName}</p>
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

        {/* Timeline */}
        {appointment.status !== 'Cancelled' && (
          <div className="mb-4">
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
                    {i < timelineIdx ? '✓' : i + 1}
                  </div>
                  <p className={`text-[9px] font-medium ${i <= timelineIdx ? 'text-primary' : 'text-gray-400'}`}>{stage}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
            <>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(hospitalName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
              >
                <Navigation2 size={12} />
                Directions
              </a>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
              >
                <XCircle size={12} />
                Cancel
              </button>
            </>
          )}
          {appointment.status === 'Completed' && !appointment.hasVisitDetails && (
            <button 
              onClick={() => onAddVisit(appointment)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
            >
              <Plus size={12} />
              Add Visit Details
            </button>
          )}
          {appointment.status === 'Completed' && appointment.hasVisitDetails && (
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold cursor-not-allowed"
              title="Visit details already added"
            >
              <CheckCircle2 size={12} />
              Visit Details Added
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main AppointmentDashboard ─────────────────────────────────────────────────
const AppointmentDashboard = ({ refreshTrigger, onFindVet }) => {
  const [data, setData] = useState({ stats: {}, upcoming: [], completed: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedVisitAppt, setSelectedVisitAppt] = useState(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await api.get('/vet/appointments');
      if (res.data.success) {
        setData({
          stats: res.data.stats || {},
          upcoming: res.data.data?.upcoming || [],
          completed: res.data.data?.completed || [],
          cancelled: res.data.data?.cancelled || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch appointments', err);
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
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-poppins font-bold text-gray-800 text-xl">My Appointments</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage all your pet appointments in one place</p>
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
          {/* Stats row */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
            <StatCard label="Upcoming" count={data.stats.upcoming || 0} icon={Calendar} color="blue" />
            <StatCard label="Pending" count={data.stats.pending || 0} icon={Clock} color="orange" />
            <StatCard label="Completed" count={data.stats.completed || 0} icon={CheckCircle2} color="green" />
            <StatCard label="Cancelled" count={data.stats.cancelled || 0} icon={XCircle} color="red" />
          </div>

          {/* Tabs */}
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

          {/* Cards */}
          <AnimatePresence mode="wait">
            {currentList.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center"
              >
                <PawPrint size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="font-bold text-gray-400 text-lg">No {activeTab} appointments</p>
                <p className="text-sm text-gray-400 mt-1 mb-6">
                  {activeTab === 'upcoming' ? 'Book your first appointment using the AI assistant above.' : `No ${activeTab} appointments yet.`}
                </p>
                {activeTab === 'upcoming' && (
                  <button
                    onClick={onFindVet}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors"
                  >
                    Find Nearby Vet
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {currentList.map((appt, i) => (
                  <AppointmentCard
                    key={appt._id}
                    appointment={appt}
                    onRefresh={fetchAppointments}
                    onAddVisit={setSelectedVisitAppt}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {selectedVisitAppt && (
        <MedicalVisitModal
          isOpen={true}
          appointment={selectedVisitAppt}
          onClose={() => setSelectedVisitAppt(null)}
          onSaveSuccess={() => {
            setSelectedVisitAppt(null);
            fetchAppointments();
          }}
        />
      )}
    </div>
  );
};

export default AppointmentDashboard;
