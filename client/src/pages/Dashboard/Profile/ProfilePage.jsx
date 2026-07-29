import React from 'react';
import { User, Mail, Phone, MapPin, Edit3, ShieldCheck, CreditCard, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeader from '../../../components/ui/SectionHeader';
import SummaryCard from '../../../components/ui/SummaryCard';
import StatCard from '../../../components/ui/StatCard';

const ProfilePage = () => {
  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader 
        title="My Profile" 
        subtitle="Manage your personal information and preferences."
        icon={User}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - User Card & Stats */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="h-32 bg-gradient-to-r from-primary/80 to-orange-400 relative">
              <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-colors">
                <Edit3 size={18} />
              </button>
            </div>
            <div className="px-6 pb-6 text-center -mt-16">
              <div className="w-32 h-32 mx-auto bg-white rounded-full p-1 border-4 border-white shadow-md relative mb-4">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Furry" 
                  alt="Avatar" 
                  className="w-full h-full rounded-full bg-blue-50"
                />
                <button className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Edit3 size={14} />
                </button>
              </div>
              <h2 className="text-2xl font-black text-gray-800">John Doe</h2>
              <p className="text-gray-500 font-medium mb-4 flex items-center justify-center gap-1">
                <ShieldCheck size={16} className="text-green-500" /> Verified Member
              </p>
              
              <div className="bg-gray-50 rounded-2xl p-4 flex justify-around">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-gray-800">2</span>
                  <span className="text-xs font-bold text-gray-500 uppercase">Pets</span>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-gray-800">12</span>
                  <span className="text-xs font-bold text-gray-500 uppercase">Visits</span>
                </div>
                <div className="w-px bg-gray-200"></div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-gray-800">3</span>
                  <span className="text-xs font-bold text-gray-500 uppercase">Years</span>
                </div>
              </div>
            </div>
          </motion.div>

          <SummaryCard title="Saved Addresses" icon={MapPin}>
            <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-800">Home</h4>
                <button className="text-gray-400 group-hover:text-primary"><Edit3 size={14} /></button>
              </div>
              <p className="text-sm text-gray-500">123 Furry Avenue, Apt 4B<br/>New York, NY 10001</p>
            </div>
          </SummaryCard>
        </div>

        {/* Right Column - Forms & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          <SummaryCard title="Personal Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <input type="text" defaultValue="John Doe" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 focus:bg-white transition-all font-medium text-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <input type="email" defaultValue="john.doe@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 focus:bg-white transition-all font-medium text-gray-800" />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 focus:bg-white transition-all font-medium text-gray-800" />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Emergency Contact</label>
                <div className="relative">
                  <input type="text" defaultValue="Jane Doe (Wife)" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 focus:bg-white transition-all font-medium text-gray-800" />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-md hover:shadow-lg hover:bg-primary-dark transition-all">
                Save Changes
              </button>
            </div>
          </SummaryCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SummaryCard title="Payment Methods" icon={CreditCard}>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-white mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-blue-900 rounded flex items-center justify-center text-white font-bold italic text-xs">VISA</div>
                  <div>
                    <p className="font-bold text-gray-800">•••• •••• •••• 4242</p>
                    <p className="text-xs text-gray-500">Expires 12/28</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-green-50 text-green-600 px-2 py-1 rounded-lg border border-green-100">Default</span>
              </div>
              <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2">
                + Add New Card
              </button>
            </SummaryCard>

            <SummaryCard title="Recent Activity" icon={Bell}>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Booked Grooming Appointment</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Updated Vaccination Record</p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
              </div>
            </SummaryCard>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
