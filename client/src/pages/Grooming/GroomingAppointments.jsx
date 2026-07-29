import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Phone, CheckCircle, Clock, XCircle, FileText, ChevronDown } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import GroomingReportForm from './components/GroomingReportForm';

const STATUS_COLORS = {
  Pending: 'bg-orange-100 text-orange-700',
  Accepted: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-purple-100 text-purple-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const GroomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedApptForReport, setSelectedApptForReport] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/grooming/center/appointments?status=${filter}`);
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/grooming/center/appointments/${id}/status`, { status });
      if (res.data.success) {
        toast.success(`Status updated to ${status}`);
        fetchAppointments();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Appointments</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your grooming schedule and clients.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-gray-700"
            >
              <option value="All">All Appointments</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[60vh]">
        {loading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Clock size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No appointments found</h3>
            <p className="text-gray-500 text-sm">You don't have any {filter !== 'All' ? filter.toLowerCase() : ''} appointments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-5">Pet / Client</th>
                  <th className="p-5">Date & Time</th>
                  <th className="p-5">Service / Style</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {appointments.map((appt) => (
                    <motion.tr
                      key={appt._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                            {appt.pet?.profileImage ? (
                              <img src={appt.pet.profileImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg text-primary">🐾</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{appt.pet?.petName}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone size={10} /> {appt.user?.phone || 'No Phone'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-medium text-gray-800 text-sm">
                          {new Date(appt.date).toLocaleDateString('en-GB')}
                        </p>
                        <p className="text-xs text-gray-500">{appt.time}</p>
                      </td>
                      <td className="p-5">
                        <p className="font-medium text-gray-800 text-sm max-w-[200px] truncate">
                          {appt.recommendedStyle || appt.selectedServices?.[0] || 'Grooming'}
                        </p>
                        {appt.specialRequests && (
                          <p className="text-xs text-amber-600 truncate max-w-[200px] mt-0.5">
                            Note: {appt.specialRequests}
                          </p>
                        )}
                      </td>
                      <td className="p-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[appt.status] || STATUS_COLORS.Pending}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-2">
                          {appt.status === 'Pending' && (
                            <>
                              <button onClick={() => handleUpdateStatus(appt._id, 'Accepted')} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Accept">
                                <CheckCircle size={16} />
                              </button>
                              <button onClick={() => handleUpdateStatus(appt._id, 'Cancelled')} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Reject">
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {appt.status === 'Accepted' && (
                            <button onClick={() => handleUpdateStatus(appt._id, 'In Progress')} className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors">
                              Start
                            </button>
                          )}
                          {appt.status === 'In Progress' && (
                            <button onClick={() => setSelectedApptForReport(appt)} className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
                              <FileText size={14} />
                              Complete
                            </button>
                          )}
                          {appt.status === 'Completed' && (
                            <span className="text-xs text-gray-400 font-medium">Done</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <GroomingReportForm
        isOpen={!!selectedApptForReport}
        appointment={selectedApptForReport}
        onClose={() => setSelectedApptForReport(null)}
        onSaveSuccess={() => {
          setSelectedApptForReport(null);
          fetchAppointments();
        }}
      />
    </div>
  );
};

export default GroomingAppointments;
