import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import dashboardBg from '../../../assets/images/dashboard.png';

const HeroCard = () => {
  const { user } = useSelector(state => state.auth);
  const { data } = useSelector(state => state.dashboard);

  return (
    <div 
      className="rounded-3xl p-8 text-white shadow-glow relative overflow-hidden mb-8 min-h-[320px] bg-cover bg-center md:bg-right flex flex-col justify-between"
      style={{ backgroundImage: `url(${dashboardBg})` }}
    >
      {/* TOP ROW */}
      <div className="flex flex-col md:flex-row justify-between items-start w-full relative z-10 gap-4">
        
        {/* Top Left: Welcome Text */}
        <div className="flex flex-col items-start">
          <h1 className="text-3xl md:text-4xl font-poppins font-bold mb-2 drop-shadow-md">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Friend'}!
          </h1>
          
          <div className="flex items-center gap-2">
            <p className="text-lg md:text-xl font-inter font-medium opacity-90 drop-shadow-md">
              Your pets are healthy today
            </p>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block animate-bounce drop-shadow-md">
              <path d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2ZM7 6C8.10457 6 9 6.89543 9 8C9 9.10457 8.10457 10 7 10C5.89543 10 5 9.10457 5 8C5 6.89543 5.89543 6 7 6ZM17 6C18.1046 6 19 6.89543 19 8C19 9.10457 18.1046 10 17 10C15.8954 10 15 9.10457 15 8C15 6.89543 15.8954 6 17 6ZM19 12C20.1046 12 21 12.8954 21 14C21 15.1046 20.1046 16 19 16C17.8954 16 17 15.1046 17 14C17 12.8954 17.8954 12 19 12ZM5 12C6.10457 12 7 12.8954 7 14C7 15.1046 6.10457 16 5 16C3.89543 16 3 15.1046 3 14C3 12.8954 3.89543 12 5 12ZM12 8C14.7614 8 17 10.2386 17 13V15C17 17.7614 14.7614 20 12 20C9.23858 20 7 17.7614 7 15V13C7 10.2386 9.23858 8 12 8Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Top Right: Ask AI Button */}
        <div>
          <button className="bg-white text-primary font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all group shadow-md">
            <Sparkles size={18} className="text-accent" />
            Ask AI Assistant
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* BOTTOM ROW (Empty now, can be removed entirely if not needed, but keeping the div structure for now) */}
      <div className="flex justify-end w-full relative z-10 mt-auto pt-8">
      </div>
    </div>
  );
};

export default HeroCard;
