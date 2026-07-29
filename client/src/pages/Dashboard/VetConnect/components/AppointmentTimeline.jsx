import React from 'react';
import { CheckCircle, Clock, FileText, UserCheck, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  { id: 'booked', label: 'Booked', icon: Clock },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { id: 'arrived', label: 'Checked In', icon: UserCheck },
  { id: 'consultation', label: 'Consultation', icon: Stethoscope },
  { id: 'completed', label: 'Completed', icon: FileText }
];

const AppointmentTimeline = ({ currentStatus = 'confirmed' }) => {
  const currentIndex = steps.findIndex(s => s.id === currentStatus);

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 overflow-hidden">
      <h3 className="font-poppins font-bold text-gray-800 mb-8">Appointment Progress</h3>
      
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-gray-100 rounded-full z-0"></div>
        
        {/* Active Line */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute top-6 left-6 h-1 bg-primary rounded-full z-0"
        ></motion.div>

        <div className="flex justify-between relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx <= currentIndex;
            const isActive = idx === currentIndex;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.2 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors duration-500
                    ${isActive ? 'bg-primary text-white shadow-glow' : 
                      isCompleted ? 'bg-primary/20 text-primary' : 'bg-gray-50 border border-gray-200 text-gray-400'}`}
                >
                  <Icon size={20} />
                </motion.div>
                <p className={`text-xs font-semibold ${isActive ? 'text-primary' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppointmentTimeline;
