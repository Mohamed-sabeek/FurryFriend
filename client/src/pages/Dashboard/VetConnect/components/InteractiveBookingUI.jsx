import React from 'react';
import { useSelector } from 'react-redux';
import { PlusCircle, CheckCircle, Calendar, Clock, Activity, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const InteractiveBookingUI = ({ bookingState, onSendMessage, onRegisterPet }) => {
  const { pets } = useSelector(state => state.pets);

  if (!bookingState) return null;

  switch (bookingState) {
    case 'SELECT_PET':
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 w-full mt-4">
          <h4 className="text-sm font-bold text-gray-700 ml-1">Select a Pet</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pets.map(pet => (
              <button
                key={pet._id}
                onClick={() => onSendMessage(pet.petName)}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:border-primary hover:shadow-md transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 group-hover:border-primary/50">
                  {pet.profileImage ? (
                    <img src={pet.profileImage} alt={pet.petName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-gray-400">{pet.petName[0]}</span>
                  )}
                </div>
                <div>
                  <h5 className="font-bold text-gray-800 group-hover:text-primary transition-colors">{pet.petName}</h5>
                  <p className="text-xs text-gray-500">{pet.species} • {pet.breed}</p>
                </div>
              </button>
            ))}
            <button
              onClick={() => onRegisterPet && onRegisterPet()}
              className="flex items-center justify-center gap-2 p-4 bg-orange-50/50 border border-orange-100 rounded-2xl hover:bg-orange-100 transition-all text-orange-600 font-bold"
            >
              <PlusCircle size={20} />
              Register New Pet
            </button>
          </div>
        </motion.div>
      );

    case 'COLLECT_REASON':
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 w-full mt-4">
          <h4 className="text-sm font-bold text-gray-700 ml-1">Select a Reason</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'General Checkup', icon: <CheckCircle size={16} /> },
              { label: 'Vaccination', icon: <FileText size={16} /> },
              { label: 'Illness', icon: <Activity size={16} /> },
              { label: 'Injury', icon: <Activity size={16} /> },
              { label: 'Emergency', icon: <Activity size={16} />, emergency: true }
            ].map(reason => (
              <button
                key={reason.label}
                onClick={() => onSendMessage(reason.label)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all text-sm ${
                  reason.emergency 
                    ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-sm'
                }`}
              >
                {reason.icon}
                {reason.label}
              </button>
            ))}
          </div>
        </motion.div>
      );

    case 'COLLECT_DATE':
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 w-full mt-4">
          <h4 className="text-sm font-bold text-gray-700 ml-1">Select a Date</h4>
          <div className="flex flex-wrap gap-2">
            {['Today', 'Tomorrow', 'Next Available'].map(date => (
              <button
                key={date}
                onClick={() => onSendMessage(date)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-sm transition-all text-sm"
              >
                <Calendar size={16} />
                {date}
              </button>
            ))}
          </div>
        </motion.div>
      );

    case 'COLLECT_TIME':
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 w-full mt-4">
          <h4 className="text-sm font-bold text-gray-700 ml-1">Select a Time</h4>
          <div className="flex flex-wrap gap-2">
            {['Morning', 'Afternoon', 'Evening'].map(time => (
              <button
                key={time}
                onClick={() => onSendMessage(time)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 hover:shadow-sm transition-all text-sm"
              >
                <Clock size={16} />
                {time}
              </button>
            ))}
          </div>
        </motion.div>
      );

    case 'SHOW_CLINICS':
    case 'CONFIRM_BOOKING':
    case 'COMPLETED':
      // The cards are already rendered as message.type === 'clinics' or 'booking' inside the chat stream
      return null;

    default:
      return null;
  }
};

export default React.memo(InteractiveBookingUI);
