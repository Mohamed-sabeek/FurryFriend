import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, FileText, Calendar, Clock, User, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const AppointmentViewModal = ({ isOpen, onClose, appointment, onAccept, onReject }) => {
  const navigate = useNavigate();

  if (!isOpen || !appointment) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pet Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Patient Info</h3>
                  <div className="flex items-center gap-4">
                    <img 
                      src={appointment.pet?.profileImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${appointment.pet?.name || 'pet'}`}
                      alt={appointment.pet?.name || 'Pet'}
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${appointment.pet?.name || 'pet'}` }}
                      className="w-16 h-16 rounded-2xl object-cover bg-gray-100"
                    />
                    <div>
                      <p className="font-bold text-lg text-gray-900">{appointment.pet?.name}</p>
                      <p className="text-sm text-gray-500 font-medium">{appointment.pet?.species} • {appointment.pet?.breed}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium">Age</p>
                      <p className="font-semibold text-gray-900">{appointment.pet?.age ? `${appointment.pet.age} years` : 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium">Gender</p>
                      <p className="font-semibold text-gray-900">{appointment.pet?.gender || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium">Weight</p>
                      <p className="font-semibold text-gray-900">{appointment.pet?.weight ? `${appointment.pet.weight} kg` : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Owner Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Owner Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <User size={16} />
                      </div>
                      <span className="font-medium">{appointment.user?.fullName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <Phone size={16} />
                      </div>
                      <span className="font-medium">{appointment.user?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <Mail size={16} />
                      </div>
                      <span className="font-medium text-sm truncate">{appointment.user?.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="my-8 h-px bg-gray-100" />

              {/* Appointment Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Appointment Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Date</p>
                      <p className="font-bold text-gray-900">{format(new Date(appointment.date), 'MMMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Time</p>
                      <p className="font-bold text-gray-900">{appointment.time}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl mt-4">
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-gray-400" /> Reason for Visit
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{appointment.reason || appointment.type}</p>
                  
                  {appointment.symptoms && appointment.symptoms.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Symptoms reported:</p>
                      <div className="flex flex-wrap gap-2">
                        {appointment.symptoms.map((symptom, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
              {appointment.status === 'Pending' && (
                <>
                  <button 
                    onClick={() => onReject(appointment._id)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button 
                    onClick={() => onAccept(appointment._id)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={18} /> Accept Appointment
                  </button>
                </>
              )}

              {(appointment.status === 'Accepted' || appointment.status === 'Confirmed') && (
                <button 
                  onClick={() => navigate(`/clinic/appointments/${appointment._id}/consultation`)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30 transition-colors flex items-center gap-2"
                >
                  <FileText size={18} /> Start Consultation
                </button>
              )}

              {(appointment.status === 'Completed' || appointment.status === 'Rejected' || appointment.status === 'Cancelled') && (
                <button 
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentViewModal;
