import React from 'react';
import { Droplet, Cookie, Syringe, Calendar } from 'lucide-react';

const reminders = [
  { id: 1, title: 'Water Reminder', time: '10:00 AM', icon: Droplet, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, title: 'Lunch Meal', time: '1:00 PM', icon: Cookie, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 3, title: 'Vet Visit', time: 'Tomorrow', icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
  { id: 4, title: 'Vaccination', time: 'Next Week', icon: Syringe, color: 'text-secondary', bg: 'bg-secondary/10' },
];

const RightPanel = () => {
  return (
    <aside className="w-[300px] fixed right-0 top-20 bottom-0 overflow-y-auto px-6 py-8 hidden lg:block border-l border-gray-100 bg-background/50">
      <h3 className="font-poppins font-bold text-lg text-text-heading mb-6">Today's Reminders</h3>
      
      <div className="space-y-4">
        {reminders.map((reminder) => {
          const Icon = reminder.icon;
          return (
            <div key={reminder.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4 hover:-translate-y-1 transition-transform cursor-pointer">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reminder.bg} ${reminder.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-text-heading">{reminder.title}</h4>
                <p className="text-xs text-text-body">{reminder.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gradient-to-br from-secondary to-[#1ea89c] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="font-poppins font-bold mb-2">Upgrade to Pro</h4>
          <p className="text-xs text-white/80 mb-4 leading-relaxed">Get unlimited AI health scans and premium boarding discounts.</p>
          <button className="bg-white text-secondary text-xs font-bold px-4 py-2 rounded-lg hover:shadow-glow transition-all">
            View Plans
          </button>
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>
    </aside>
  );
};

export default RightPanel;
