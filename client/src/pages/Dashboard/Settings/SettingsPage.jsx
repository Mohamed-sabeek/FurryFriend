import React, { useState } from 'react';
import { Settings, Bell, Lock, Shield, Moon, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import SectionHeader from '../../../components/ui/SectionHeader';
import SummaryCard from '../../../components/ui/SummaryCard';

const SettingsPage = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    appointments: true,
    marketing: false
  });

  const Toggle = ({ checked, onChange }) => (
    <button 
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <SectionHeader 
        title="Settings" 
        subtitle="Manage your app preferences and account settings."
        icon={Settings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Nav (Simulated) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 sticky top-6">
            <nav className="space-y-1">
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-red-50 text-primary font-bold">
                <div className="flex items-center gap-3"><Bell size={18} /> Notifications</div>
                <ChevronRight size={16} />
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                <div className="flex items-center gap-3"><Lock size={18} /> Security</div>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                <div className="flex items-center gap-3"><Moon size={18} /> Appearance</div>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                <div className="flex items-center gap-3"><Shield size={18} /> Privacy</div>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          <SummaryCard title="Notification Preferences" icon={Bell}>
            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-800">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive weekly summaries and important updates via email.</p>
                </div>
                <Toggle checked={notifications.email} onChange={() => setNotifications({...notifications, email: !notifications.email})} />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-800">SMS Alerts</h4>
                  <p className="text-sm text-gray-500">Get text messages for urgent appointment reminders.</p>
                </div>
                <Toggle checked={notifications.sms} onChange={() => setNotifications({...notifications, sms: !notifications.sms})} />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-800">Appointment Reminders</h4>
                  <p className="text-sm text-gray-500">Push notifications 24 hours before scheduled visits.</p>
                </div>
                <Toggle checked={notifications.appointments} onChange={() => setNotifications({...notifications, appointments: !notifications.appointments})} />
              </div>
            </div>
          </SummaryCard>

          <SummaryCard title="Account Security" icon={Lock}>
            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                <div>
                  <h4 className="font-bold text-gray-800">Change Password</h4>
                  <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                </div>
                <button className="px-5 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  Update
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                <div>
                  <h4 className="font-bold text-gray-800">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button className="px-5 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-colors">
                  Enable
                </button>
              </div>
            </div>
          </SummaryCard>

          <div className="bg-red-50 rounded-3xl p-6 border border-red-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-red-800 text-lg">Delete Account</h3>
              <p className="text-red-600/80 text-sm mt-1">Permanently remove your account and all data. This cannot be undone.</p>
            </div>
            <button className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm whitespace-nowrap ml-4">
              Delete Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
