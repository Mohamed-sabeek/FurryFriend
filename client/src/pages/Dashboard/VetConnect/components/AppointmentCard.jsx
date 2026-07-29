import React from 'react';
import { Clock, MapPin, FileText, Download, MoreVertical, Copy, Star, Trash2, Edit2 } from 'lucide-react';

const AppointmentCard = ({ appointment }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col md:flex-row gap-6">
      
      {/* Left Col: Pet & Basic Info */}
      <div className="flex items-start gap-4 md:w-1/3">
        <img 
          src={`https://ui-avatars.com/api/?name=${appointment.pet?.name || 'Pet'}&background=FF6B6B&color=fff&size=128`}
          alt="Pet" 
          className="w-16 h-16 rounded-2xl object-cover shadow-sm"
        />
        <div>
          <h3 className="text-lg font-poppins font-bold text-gray-800">{appointment.pet?.name || 'Your Pet'}</h3>
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{appointment.type}</p>
          <div className="inline-block px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600">
            {appointment.status}
          </div>
        </div>
      </div>

      {/* Middle Col: Date, Time, Clinic */}
      <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 space-y-3">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock size={16} className="text-gray-400" />
          <span className="text-sm font-semibold">{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin size={16} className="text-gray-400" />
          <span className="text-sm">{appointment.clinic?.name || 'City Vet Clinic'} - Dr. {appointment.vet?.name || 'Doctor'}</span>
        </div>
        <p className="text-sm text-gray-500 italic mt-2 line-clamp-1">"{appointment.reason}"</p>
      </div>

      {/* Right Col: Actions */}
      <div className="flex items-center gap-2 md:w-48 justify-end shrink-0">
        <button className="flex-1 bg-primary/10 text-primary font-bold px-4 py-2 rounded-xl hover:bg-primary hover:text-white transition-colors text-sm">
          View
        </button>
        
        <div className="relative group/menu cursor-pointer">
          <button className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
            <MoreVertical size={18} />
          </button>
          
          {/* Dropdown Menu (Hover based for simplicity, usually state based) */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 py-2">
            <div className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <Edit2 size={16} /> Edit
            </div>
            <div className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <Copy size={16} /> Duplicate
            </div>
            {appointment.status === 'Completed' && (
              <>
                <div className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <Download size={16} /> Prescription
                </div>
                <div className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <FileText size={16} /> Medical Report
                </div>
                <div className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <Star size={16} /> Rate Doctor
                </div>
              </>
            )}
            <div className="px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-sm text-red-600 cursor-pointer border-t border-gray-100 mt-1">
              <Trash2 size={16} /> Cancel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;
