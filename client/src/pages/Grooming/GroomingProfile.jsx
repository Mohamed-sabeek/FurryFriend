import React from 'react';
import { User, Mail, Phone, MapPin, Scissors } from 'lucide-react';
import { useSelector } from 'react-redux';

const GroomingProfile = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Center Profile</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Manage your grooming center's public information and working hours.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20 text-primary">
            <Scissors size={40} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.fullName || 'Grooming Studio'}</h2>
            <p className="text-gray-500 font-medium">Update your center details below.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Center Name</label>
            <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" defaultValue={user?.fullName || 'Grooming Studio'} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" defaultValue={user?.email || 'contact@grooming.com'} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
            <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" defaultValue="+1 234 567 8900" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
            <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" defaultValue="456 Pet Avenue, City" />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end">
          <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-sm shadow-primary/30">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroomingProfile;
