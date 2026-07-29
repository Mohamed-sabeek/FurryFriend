import React from 'react';
import { Calendar, Clock, MapPin, Video, Navigation, Edit2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const UpcomingAppointmentCard = ({ appointment }) => {
  if (!appointment) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center mb-8">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
          <Calendar size={48} />
        </div>
        <h3 className="text-xl font-poppins font-bold text-text-heading mb-2">No Upcoming Appointments</h3>
        <p className="text-text-body max-w-sm mb-6">
          Your pets are all caught up! Book a new appointment for checkups, vaccinations, or grooming.
        </p>
      </div>
    );
  }

  // Calculate countdown (mocked for UI purposes)
  const daysLeft = 2;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-lg shadow-gray-100/50 mb-8 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      
      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        {/* Left Col: Pet & Vet Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Upcoming
            </span>
            <span className="text-sm font-semibold text-gray-500">In {daysLeft} Days</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <img 
              src={`https://ui-avatars.com/api/?name=${appointment.pet?.name || 'Pet'}&background=FF6B6B&color=fff&size=128`}
              alt="Pet" 
              className="w-16 h-16 rounded-2xl object-cover shadow-sm"
            />
            <div>
              <h3 className="text-2xl font-poppins font-bold text-text-heading">{appointment.pet?.name || 'Your Pet'}</h3>
              <p className="text-sm text-gray-500 font-medium">{appointment.type || 'General Checkup'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Date & Time</p>
                <p className="font-semibold text-gray-800">{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                <p className="text-sm text-gray-500">{appointment.time}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Clinic & Vet</p>
                <p className="font-semibold text-gray-800">{appointment.clinic?.name || 'City Vet Clinic'}</p>
                <p className="text-sm text-gray-500">Dr. {appointment.vet?.name || 'Sarah Johnson'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Actions & Details */}
        <div className="md:w-72 shrink-0 flex flex-col justify-between">
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-xs text-gray-500 font-medium mb-1">Reason for visit</p>
            <p className="text-sm font-semibold text-gray-800 mb-3">{appointment.reason || 'Annual checkup and vaccination booster.'}</p>
            
            {appointment.symptoms && appointment.symptoms.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Reported Symptoms</p>
                <div className="flex flex-wrap gap-1.5">
                  {appointment.symptoms.map(s => (
                    <span key={s} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {appointment.videoConsultation ? (
              <button className="w-full bg-blue-600 text-white font-bold px-4 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-glow-blue flex items-center justify-center gap-2">
                <Video size={18} />
                Join Video Call
              </button>
            ) : (
              <button className="w-full bg-gray-900 text-white font-bold px-4 py-3 rounded-xl hover:bg-black transition-colors shadow-glow-dark flex items-center justify-center gap-2">
                <Navigation size={18} />
                Get Directions
              </button>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              <button className="w-full bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm">
                <Edit2 size={16} />
                Reschedule
              </button>
              <button className="w-full bg-white border border-red-200 text-red-600 font-semibold px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm">
                <XCircle size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UpcomingAppointmentCard;
