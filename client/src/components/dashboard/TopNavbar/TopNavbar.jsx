import React from 'react';
import { useSelector } from 'react-redux';
import { Search, Bell, MessageSquare, Moon } from 'lucide-react';

const TopNavbar = () => {
  const { user } = useSelector(state => state.auth);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="h-20 bg-background/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Greeting */}
      <div>
        <p className="text-text-body font-inter text-sm">{getGreeting()},</p>
        <h2 className="text-2xl font-poppins font-bold text-text-heading capitalize">
          {user?.fullName?.split(' ')[0] || 'Pet Parent'}
        </h2>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <input 
            type="text" 
            placeholder="Search pets, appointments..." 
            className="pl-10 pr-4 py-2.5 bg-white border-none rounded-full w-[300px] shadow-sm text-sm font-inter focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-primary transition-colors relative">
            <Bell size={18} />
          </button>
        </div>

        {/* Profile Avatar (Mobile fallback or secondary) */}
        <div className="md:hidden w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold shadow-glow cursor-pointer">
          {user?.fullName?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
