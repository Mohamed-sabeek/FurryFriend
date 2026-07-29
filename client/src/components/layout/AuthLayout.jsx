import React from 'react';
import loginImage from '../../assets/login.png';

const AuthLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen md:h-screen w-full bg-[#FFF9F5] md:bg-[#E5F1F6] font-inter overflow-x-hidden md:overflow-hidden">
      {/* DESKTOP BACKGROUND IMAGE (Full Viewport) */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <img 
          src={loginImage} 
          alt="Happy Pets" 
          className="w-full h-full object-cover object-right-bottom" 
        />
      </div>

      {/* MOBILE HERO IMAGE */}
      <div className="md:hidden relative w-full h-[35vh]">
        <img 
          src={loginImage} 
          alt="Happy Pets" 
          className="absolute inset-0 w-full h-full object-cover object-[center_70%]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFF9F5] via-transparent to-transparent" />
      </div>

      {/* CONTENT CONTAINER - Positions card on the left for desktop, bottom for mobile */}
      <div className="relative z-10 flex flex-col md:absolute md:inset-0 md:flex-row md:items-center justify-center md:justify-start p-4 py-8 md:p-8 lg:p-12 xl:p-16">
        {/* On mobile, this div wraps the form tightly. On desktop, it's vertically centered on the left. */}
        <div className="w-full max-w-[480px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
