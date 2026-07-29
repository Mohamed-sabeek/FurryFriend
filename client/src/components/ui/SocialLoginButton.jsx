import React from 'react';
import { cn } from '../../utils/utils';

const SocialLoginButton = ({ icon, provider, onClick, className }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 xl:gap-3 py-2.5 xl:py-3 px-4 bg-white border border-gray-200 rounded-xl text-text-heading text-sm font-semibold transition-all duration-200",
        "hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm active:bg-gray-100",
        className
      )}
    >
      {icon}
      <span>{provider}</span>
    </button>
  );
};

export default SocialLoginButton;
