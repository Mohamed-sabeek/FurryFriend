import React from 'react';
import { MapPin, Star, Phone, Clock, CalendarCheck } from 'lucide-react';
import api from '../../../../utils/axios';
import toast from 'react-hot-toast';

const ClinicCards = ({ clinics, conversationId, onBookClinic }) => {
  if (!clinics || clinics.length === 0) return null;

  const handleBook = async (clinic) => {
    try {
      const res = await api.post('/vet/appointments/confirm-ai', {
        conversationId,
        clinicId: clinic._id
      });
      if (res.data.success) {
        toast.success(`Booked appointment at ${clinic.name}!`);
        if (onBookClinic) {
          const apt = res.data.data;
          const mappedBooking = {
            petName: apt.pet?.petName,
            petSpecies: apt.pet?.species,
            hospitalName: apt.hospitalName,
            appointmentType: apt.type,
            date: new Date(apt.date).toLocaleDateString(),
            time: apt.time,
            status: apt.status
          };
          onBookClinic(mappedBooking);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to confirm booking.');
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-gray-800 font-bold mb-2">Available Clinics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clinics.map(clinic => (
          <div key={clinic._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-gray-800">{clinic.name}</h4>
              <div className="flex items-center gap-1 text-yellow-500 text-sm font-medium bg-yellow-50 px-2 py-0.5 rounded-full">
                <Star size={14} className="fill-current" />
                <span>{clinic.rating}</span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <span>{clinic.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-400 shrink-0" />
                <span>{clinic.openingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <span>{clinic.phone}</span>
              </div>
            </div>
            
            <button
              onClick={() => handleBook(clinic)}
              className="w-full py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <CalendarCheck size={16} />
              Book Appointment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClinicCards;
