import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Home, XCircle, ChevronRight, Activity, HandHeart, Check } from 'lucide-react';
import api from '../../../../utils/axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'Pending': 'bg-yellow-50 text-yellow-600 border-yellow-100',
  'Accepted': 'bg-blue-50 text-blue-600 border-blue-100',
  'Checked In': 'bg-purple-50 text-purple-600 border-purple-100',
  'Checked Out': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  'Completed': 'bg-green-50 text-green-600 border-green-100',
  'Cancelled': 'bg-red-50 text-red-600 border-red-100',
  'Rejected': 'bg-red-50 text-red-600 border-red-100'
};

const BoardingAppointmentDashboard = ({ refreshTrigger, onFindBoarding }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/boarding/customer/appointments');
        if (res.data.success) {
          setAppointments(res.data.data);
        }
      } catch (error) {
        toast.error('Failed to load boarding bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Home size={40} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Boarding Bookings</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't booked any boarding stays for your pets yet. Let TravelPaws AI help you find the perfect place.</p>
        <button
          onClick={onFindBoarding}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-sm"
        >
          Check Eligibility & Book
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <AnimatePresence>
          {appointments.map((appt) => (
            <motion.div
              key={appt._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Center Details */}
                <div className="md:w-64 shrink-0 flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden mb-4">
                     <img src={`/src/assets/images/${appt.center.logo || 'boarding-logo.png'}`} alt={appt.center.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-gray-900">{appt.center.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{appt.center.city}</p>
                  
                  <div className={`mt-4 px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[appt.status] || STATUS_COLORS.Pending}`}>
                    {appt.status}
                  </div>
                </div>

                {/* Booking Details & Timeline */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">Stay Details</h4>
                      <p className="text-sm text-gray-500 font-medium">Pet: {appt.pet.petName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total Cost</p>
                      <p className="text-lg font-bold text-gray-900">₹{appt.estimatedCost}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Check In</p>
                      <p className="font-semibold text-gray-900">{new Date(appt.checkInDate).toLocaleDateString('en-GB')}</p>
                    </div>
                    <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100/50">
                      <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Check Out</p>
                      <p className="font-semibold text-gray-900">{new Date(appt.checkOutDate).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Live Updates</h5>
                    <div className="space-y-4">
                      {appt.timeline && appt.timeline.map((event, index) => {
                        const isLast = index === appt.timeline.length - 1;
                        return (
                          <div key={index} className="flex gap-4 relative">
                            {!isLast && (
                              <div className="absolute left-2.5 top-6 bottom-[-16px] w-0.5 bg-primary/20" />
                            )}
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5 z-10">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800">{event.status}</p>
                              <p className="text-xs text-gray-500 font-medium">{new Date(event.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BoardingAppointmentDashboard;
