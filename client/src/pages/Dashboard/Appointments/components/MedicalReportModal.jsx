import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, FileText, Activity, Syringe, AlertTriangle, 
  HeartPulse, Pill, Calendar, Clock, MapPin, CheckCircle2 
} from 'lucide-react';
import api from '../../../../utils/axios';

const MedicalReportModal = ({ isOpen, appointmentId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!appointmentId || !isOpen) return;
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/vet/appointments/${appointmentId}/medical-report`);
        if (res.data.success) {
          setReport(res.data.data);
        } else {
          setError('Failed to fetch medical report.');
        }
      } catch (err) {
        console.error('Error fetching medical report:', err);
        setError(err.response?.data?.message || err.message || 'An error occurred while fetching the report.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [appointmentId, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-poppins font-bold text-gray-800">Full Medical Report</h2>
                <p className="text-sm text-gray-500">Official consultation record</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-medium text-sm animate-pulse">Loading medical records...</p>
              </div>
            ) : error || !report ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center font-medium">
                <AlertTriangle size={32} className="mx-auto mb-3 text-red-500" />
                {error || 'Report not available.'}
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. Header Info (Pet, Doctor, Clinic) */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                        {report.appointment.pet?.profileImage ? (
                          <img src={report.appointment.pet.profileImage} alt="Pet" className="w-full h-full rounded-2xl object-cover" />
                        ) : (
                          <span className="text-3xl">🐾</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{report.appointment.pet?.petName}</h3>
                        <p className="text-sm text-gray-500 font-medium">
                          {report.appointment.pet?.species} • {report.appointment.pet?.breed || 'Unknown breed'}
                        </p>
                      </div>
                    </div>
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-green-200">
                      <CheckCircle2 size={16} />
                      Consultation Completed
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Doctor</p>
                      <p className="font-semibold text-gray-800">Dr. {report.healthRecord?.doctor || 'Vet'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Date</p>
                      <p className="font-semibold text-gray-800">{new Date(report.healthRecord?.visitDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Hospital</p>
                      <p className="font-semibold text-gray-800 truncate" title={report.healthRecord?.hospital}>{report.healthRecord?.hospital}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Visit Type</p>
                      <p className="font-semibold text-gray-800">{report.healthRecord?.visitType}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column (Main Consultation) */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Diagnosis & Treatment */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                        <Activity className="text-primary" size={20} />
                        Diagnosis & Treatment
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Diagnosis</p>
                          <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            {report.healthRecord?.diagnosis || 'No diagnosis provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Treatment Plan</p>
                          <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            {report.healthRecord?.treatment || 'No treatment provided'}
                          </p>
                        </div>
                        {report.healthRecord?.notes && (
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Doctor's Notes</p>
                            <p className="font-medium text-gray-600 bg-yellow-50 p-3 rounded-xl border border-yellow-100 whitespace-pre-wrap">
                              {report.healthRecord.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Medications */}
                    {report.medicines && report.medicines.length > 0 && (
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                          <Pill className="text-blue-500" size={20} />
                          Prescriptions ({report.medicines.length})
                        </h4>
                        <div className="space-y-3">
                          {report.medicines.map((med, i) => (
                            <div key={i} className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-start justify-between">
                              <div>
                                <h5 className="font-bold text-blue-900 mb-1">{med.medicineName}</h5>
                                <p className="text-sm text-blue-700">{med.dosage} • {med.frequency}</p>
                              </div>
                              <span className="text-xs font-bold text-blue-500 bg-blue-100 px-2 py-1 rounded-md">{med.purpose || 'Medication'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vaccinations */}
                    {report.vaccinations && report.vaccinations.length > 0 && (
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                          <Syringe className="text-green-500" size={20} />
                          Vaccinations Given ({report.vaccinations.length})
                        </h4>
                        <div className="space-y-3">
                          {report.vaccinations.map((vax, i) => (
                            <div key={i} className="bg-green-50/50 border border-green-100 p-4 rounded-xl flex items-start justify-between">
                              <div>
                                <h5 className="font-bold text-green-900 mb-1">{vax.vaccineName}</h5>
                                <p className="text-sm text-green-700">Next due: {vax.nextDueDate ? new Date(vax.nextDueDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column (Vitals & Lifestyle) */}
                  <div className="space-y-6">
                    {/* Vitals */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                      <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                        <HeartPulse className="text-red-500" size={20} />
                        Vitals
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-gray-500 font-medium">Weight</span>
                          <span className="font-bold text-gray-800">{report.healthRecord?.weight ? `${report.healthRecord.weight} kg` : '--'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                          <span className="text-gray-500 font-medium">Temperature</span>
                          <span className="font-bold text-gray-800">{report.healthRecord?.temperature ? `${report.healthRecord.temperature}°` : '--'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-500 font-medium">Heart Rate</span>
                          <span className="font-bold text-gray-800">{report.healthRecord?.heartRate ? `${report.healthRecord.heartRate} bpm` : '--'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Follow Up */}
                    <div className="bg-gradient-to-br from-indigo-500 to-primary text-white rounded-2xl p-6 shadow-lg">
                      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Calendar size={20} />
                        Follow-Up
                      </h4>
                      {report.healthRecord?.followUpDate ? (
                        <div>
                          <p className="text-indigo-100 text-sm mb-1">Next scheduled visit</p>
                          <p className="text-2xl font-bold">{new Date(report.healthRecord.followUpDate).toLocaleDateString()}</p>
                        </div>
                      ) : (
                        <p className="text-indigo-100">No follow-up visit scheduled.</p>
                      )}
                    </div>

                    {/* Lifestyle Advice */}
                    {(report.healthRecord?.dietAdvice || report.healthRecord?.exerciseAdvice) && (
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                          <FileText className="text-orange-500" size={20} />
                          Lifestyle Advice
                        </h4>
                        <div className="space-y-4">
                          {report.healthRecord?.dietAdvice && (
                            <div>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Dietary</p>
                              <p className="font-medium text-gray-700 text-sm bg-orange-50 p-3 rounded-xl border border-orange-100">
                                {report.healthRecord.dietAdvice}
                              </p>
                            </div>
                          )}
                          {report.healthRecord?.exerciseAdvice && (
                            <div>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Exercise</p>
                              <p className="font-medium text-gray-700 text-sm bg-blue-50 p-3 rounded-xl border border-blue-100">
                                {report.healthRecord.exerciseAdvice}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MedicalReportModal;
