import React from 'react';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NextAppointmentCard = () => {
  const navigate = useNavigate();
  
  // Empty until API is integrated
  const hasAppointment = false;

  if (!hasAppointment) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow mb-6 cursor-pointer"
      onClick={() => navigate('/dashboard/appointments')}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-poppins font-bold text-gray-800 flex items-center gap-2">
          <Calendar size={20} className="text-primary" />
          Next Appointment
        </h3>
        <span className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
          View all <ArrowRight size={16} />
        </span>
      </div>

      <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center shrink-0 border border-gray-100 text-primary font-bold">
          <span className="text-xs uppercase">Oct</span>
          <span className="text-lg leading-none">24</span>
        </div>
        
        <div className="flex-1">
          <p className="font-bold text-gray-800">General Checkup - Max</p>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1"><Clock size={14} /> 10:00 AM</span>
            <span className="flex items-center gap-1"><MapPin size={14} /> City Vet Clinic</span>
          </div>
        </div>
        
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-500 font-medium">In</p>
          <p className="text-xl font-bold text-gray-800">2 Days</p>
        </div>
      </div>
    </motion.div>
  );
};

export default NextAppointmentCard;
