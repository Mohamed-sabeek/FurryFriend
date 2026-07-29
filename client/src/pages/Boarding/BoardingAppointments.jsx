import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Phone, CheckCircle, Clock, XCircle, FileText, Calendar, User } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import BoardingReportForm from './components/BoardingReportForm';

const STATUS_COLORS = {
  'Pending': 'bg-yellow-50 text-yellow-600',
  'Accepted': 'bg-blue-50 text-blue-600',
  'Checked In': 'bg-purple-50 text-purple-600',
  'Checked Out': 'bg-indigo-50 text-indigo-600',
  'Completed': 'bg-green-50 text-green-600',
  'Cancelled': 'bg-red-50 text-red-600',
  'Rejected': 'bg-red-50 text-red-600'
};

const BoardingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedApptForReport, setSelectedApptForReport] = useState(null);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/boarding/center/appointments');
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (filter === 'All') return appointments;
    return appointments.filter(a => a.status === filter);
  }, [appointments, filter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/boarding/center/appointments/${id}/status`, { status });
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
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Bookings</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your boarding reservations.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-gray-700"
            >
              <option value="All">All Bookings</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[60vh]">
        {loading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center px-6">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No bookings found</h3>
            <p className="text-gray-500 text-sm">You don't have any {filter !== 'All' ? filter.toLowerCase() : ''} bookings yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="p-5">Pet / Owner</th>
                  <th className="p-5">Check In</th>
                  <th className="p-5">Check Out</th>
                  <th className="p-5">Duration / Cost</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filteredAppointments.map((appt) => (
                    <motion.tr
                      key={appt._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <img 
                            src={(appt.pet?.profileImage && appt.pet.profileImage !== 'default.jpg') 
                              ? (appt.pet.profileImage.startsWith('http') ? appt.pet.profileImage : `http://localhost:5000/uploads/${appt.pet.profileImage}`)
                              : `https://api.dicebear.com/7.x/shapes/svg?seed=${appt.pet?.petName || 'pet'}`
                            }
                            alt={appt.pet?.petName || 'Pet'}
                            className="w-14 h-14 rounded-full object-cover bg-primary/5 border border-gray-100 shadow-sm shrink-0"
                            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=fallback` }}
                          />
                          <div className="flex flex-col gap-1">
                            <p className="font-bold text-gray-800 text-sm">{appt.pet?.petName} ({appt.pet?.breed || appt.pet?.species})</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <User size={10} /> {appt.user?.fullName} | <Phone size={10} /> {appt.user?.phone || 'No Phone'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-medium text-gray-800 text-sm">
                          {new Date(appt.checkInDate).toLocaleDateString('en-GB')}
                        </p>
                      </td>
                      <td className="p-5">
                        <p className="font-medium text-gray-800 text-sm">
                          {new Date(appt.checkOutDate).toLocaleDateString('en-GB')}
                        </p>
                      </td>
                      <td className="p-5">
                        <p className="font-medium text-gray-800 text-sm max-w-[200px] truncate">
                          {appt.duration} days
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">
                          ${appt.estimatedCost}
                        </p>
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
                              <button onClick={() => handleUpdateStatus(appt._id, 'Rejected')} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Reject">
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {appt.status === 'Accepted' && (
                            <button onClick={() => handleUpdateStatus(appt._id, 'Checked In')} className="px-3 py-1.5 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors">
                              Check In
                            </button>
                          )}
                          {appt.status === 'Checked In' && (
                            <button onClick={() => handleUpdateStatus(appt._id, 'Checked Out')} className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors">
                              Check Out
                            </button>
                          )}
                          {appt.status === 'Checked Out' && (
                            <button onClick={() => setSelectedApptForReport(appt)} className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
                              <FileText size={14} />
                              Complete Stay
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

      <BoardingReportForm
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

export default BoardingAppointments;
