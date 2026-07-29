import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Syringe, Pill, CalendarCheck, Clock, MapPin, Search } from 'lucide-react';

const getTimelineIcon = (type) => {
  switch (type) {
    case 'record': return <FileText className="text-blue-500" size={20} />;
    case 'vaccination': return <Syringe className="text-green-500" size={20} />;
    case 'medication': return <Pill className="text-purple-500" size={20} />;
    case 'appointment': return <CalendarCheck className="text-orange-500" size={20} />;
    default: return <Activity className="text-gray-500" size={20} />;
  }
};

const getTimelineColor = (type) => {
  switch (type) {
    case 'record': return 'bg-blue-100 border-blue-200';
    case 'vaccination': return 'bg-green-100 border-green-200';
    case 'medication': return 'bg-purple-100 border-purple-200';
    case 'appointment': return 'bg-orange-100 border-orange-200';
    default: return 'bg-gray-100 border-gray-200';
  }
};

const MedicalTimeline = ({ pet, timelineData, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { timeline = [] } = timelineData || {};

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-poppins font-bold text-text-heading">Medical Timeline</h2>
          <p className="text-sm text-gray-500 font-medium">History of all visits, vaccines, and medications.</p>
        </div>
        
        {/* Simple Search/Filter Mock */}
        <div className="relative hidden sm:block">
          <input 
            type="text" 
            placeholder="Search records..." 
            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      <div className="p-6">
        {timeline.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No Medical Records</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              There is no medical history available for {pet?.petName}. Add a past record or book an appointment.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 py-4">
            {timeline.map((item, idx) => (
              <motion.div 
                key={`${item.type}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-8"
              >
                {/* Timeline Dot */}
                <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${getTimelineColor(item.type)}`}>
                  {getTimelineIcon(item.type)}
                </div>

                <div className="bg-gray-50 hover:bg-gray-100/50 transition-colors rounded-2xl p-5 border border-gray-100 group">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          {item.type}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Clock size={12} /> {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {item.type === 'record' && (item.data.visitType || 'Vet Visit')}
                        {item.type === 'vaccination' && (item.data.vaccineName || 'Vaccination')}
                        {item.type === 'medication' && (item.data.medicineName || 'Medication')}
                        {item.type === 'appointment' && (item.data.type || 'Appointment')}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    {item.type === 'appointment' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.data.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                        item.data.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {item.data.status}
                      </span>
                    )}
                    {item.type === 'vaccination' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.data.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        item.data.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.data.status}
                      </span>
                    )}
                  </div>

                  {/* Context Data */}
                  <div className="text-sm text-gray-600 space-y-2">
                    {item.data.hospital && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin size={14} /> {item.data.hospital} {item.data.doctor && `• ${item.data.doctor}`}
                      </div>
                    )}
                    
                    {item.type === 'record' && item.data.diagnosis && (
                      <p><strong>Diagnosis:</strong> {item.data.diagnosis}</p>
                    )}
                    
                    {item.type === 'medication' && (
                      <p>{item.data.dosage} • {item.data.frequency}</p>
                    )}

                    {item.type === 'appointment' && item.data.reason && (
                      <p><strong>Reason:</strong> {item.data.reason}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalTimeline;
