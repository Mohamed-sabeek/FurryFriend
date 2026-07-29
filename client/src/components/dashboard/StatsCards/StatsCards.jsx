import React from 'react';
import { useSelector } from 'react-redux';
import { Dog, CalendarCheck, Activity, ShoppingBag } from 'lucide-react';

const StatsCards = () => {
  const { data } = useSelector(state => state.dashboard);
  const stats = data?.stats || { totalPets: 0, upcomingAppointments: 0, healthReports: 0, activeOrders: 0 };

  const cards = [
    {
      title: 'Total Pets',
      value: stats.totalPets,
      icon: Dog,
      color: 'text-primary',
      bg: 'bg-primary/10',
      gradient: 'from-primary/20 to-transparent'
    },
    {
      title: 'Appointments',
      value: stats.upcomingAppointments,
      icon: CalendarCheck,
      color: 'text-secondary',
      bg: 'bg-secondary/10',
      gradient: 'from-secondary/20 to-transparent'
    },
    {
      title: 'Health Reports',
      value: stats.healthReports,
      icon: Activity,
      color: 'text-green-500',
      bg: 'bg-green-50',
      gradient: 'from-green-500/20 to-transparent'
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: ShoppingBag,
      color: 'text-accent',
      bg: 'bg-accent/10',
      gradient: 'from-accent/20 to-transparent'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-text-body text-sm font-inter mb-1">{card.title}</p>
                <h3 className="text-3xl font-poppins font-bold text-text-heading">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bg} ${card.color}`}>
                <Icon size={24} />
              </div>
            </div>
            
            {/* Fake small chart / decorative line at the bottom */}
            <div className="mt-4 flex items-center gap-1 h-8 opacity-50 relative z-10">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-1/6 rounded-t-sm bg-current ${card.color}`} 
                  style={{ height: `${Math.random() * 100}%` }}
                ></div>
              ))}
            </div>

            {/* Background gradient on hover */}
            <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
