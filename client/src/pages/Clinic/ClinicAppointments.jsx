import React, { useState, useEffect } from 'react';
import { Search, Filter, CalendarCheck, Clock, CheckCircle2, XCircle, Eye } from 'lucide-react';
import api from '../../utils/axios';
import { format } from 'date-fns';
import AppointmentViewModal from './AppointmentViewModal';
import toast from 'react-hot-toast';

const ClinicAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clinic/appointments', {
        params: { filter, search: searchQuery }
      });
      setAppointments(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAppointments();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [filter, searchQuery]);

  const handleAccept = async (id) => {
    try {
      await api.patch(`/clinic/appointments/${id}/accept`);
      toast.success('Appointment accepted');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to accept appointment');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/clinic/appointments/${id}/reject`);
      toast.success('Appointment rejected');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to reject appointment');
    }
  };


  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1 w-max"><Clock size={12} /> Pending</span>;
      case 'Accepted':
      case 'Confirmed':
        return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CalendarCheck size={12} /> Accepted</span>;
      case 'Completed':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1 w-max"><CheckCircle2 size={12} /> Completed</span>;
      case 'Rejected':
      case 'Cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-max"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage all your clinic appointments.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Controls */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Pet, Owner, or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
            {['All', 'Pending', 'Accepted', 'Completed', 'Rejected', 'Today', 'Upcoming'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  filter === f 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Pet Info</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">Loading appointments...</td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <CalendarCheck size={24} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No appointments found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map(appt => (
                  <tr key={appt._id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={appt.pet?.profileImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${appt.pet?.name || 'pet'}`}
                          alt={appt.pet?.name || 'Pet'}
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${appt.pet?.name || 'pet'}` }}
                          className="w-10 h-10 rounded-full object-cover bg-gray-100 border border-gray-200"
                        />
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{appt.pet?.name}</p>
                          <p className="text-xs text-gray-500 font-medium">{appt.pet?.species} • {appt.pet?.breed}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-700">{appt.user?.fullName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-700">{format(new Date(appt.date), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">{appt.time}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 font-medium truncate max-w-[150px]">{appt.type}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(appt.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedAppointment(appt)}
                        className="p-2 text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-colors font-bold inline-flex items-center justify-center"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AppointmentViewModal 
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </div>
  );
};

export default ClinicAppointments;
