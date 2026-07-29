import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, Clock, Calendar, Download, CalendarPlus, PawPrint } from 'lucide-react';

const SPECIES_EMOJI = {
  Dog: '🐶', Cat: '🐱', Bird: '🐦', Rabbit: '🐰', Fish: '🐠', Hamster: '🐹', Turtle: '🐢', Other: '🐾'
};

const AppointmentConfirmCard = ({ booking }) => {
  if (!booking) return null;

  const {
    petName, petSpecies, hospitalName, appointmentType, date, time, status
  } = booking;

  const petEmoji = SPECIES_EMOJI[petSpecies] || '🐾';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="mt-4 rounded-3xl overflow-hidden shadow-lg border border-green-100"
    >
      {/* Green header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
            <CheckCircle2 size={28} className="text-white" />
          </div>
          <div>
            <h3 className="font-poppins font-bold text-lg leading-tight">Appointment Confirmed!</h3>
            <p className="text-green-100 text-sm">Your booking is all set ✓</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white p-5 space-y-3">
        {/* Pet */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
          <span className="text-2xl">{petEmoji}</span>
          <div>
            <p className="text-xs text-gray-400 font-medium">Pet</p>
            <p className="font-bold text-gray-800">{petName}</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">{appointmentType}</span>
          </div>
        </div>

        {/* Hospital */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <MapPin size={16} className="text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Hospital</p>
            <p className="font-semibold text-gray-800 text-sm">{hospitalName}</p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
              <Calendar size={16} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Date</p>
              <p className="font-semibold text-gray-800 text-sm">{date}</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Time</p>
              <p className="font-semibold text-gray-800 text-sm">{time}</p>
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="flex items-center gap-2 text-sm text-green-600 font-bold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {status || 'Confirmed'}
          </span>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Download size={13} />
              Save
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
              <CalendarPlus size={13} />
              Calendar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AppointmentConfirmCard;
