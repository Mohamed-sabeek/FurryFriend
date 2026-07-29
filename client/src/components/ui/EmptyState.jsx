import React from 'react';

const EmptyState = ({ icon: Icon, title, description, actionButton }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
        {Icon && <Icon className="text-gray-300" size={40} />}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
