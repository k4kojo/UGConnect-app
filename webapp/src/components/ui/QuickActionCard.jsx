import React from 'react';

const QuickActionCard = ({ 
  name, 
  icon: Icon, 
  color = 'bg-gray-100 hover:bg-gray-200', 
  onClick, 
  description = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`${color} p-4 rounded-lg transition-colors duration-200 flex flex-col items-center justify-center space-y-2 group`}
      title={description}
    >
      <Icon className="h-6 w-6 text-gray-600 group-hover:scale-110 transition-transform" />
      <span className="text-xs text-gray-700 capitalize text-center">{name}</span>
    </button>
  );
};

export default QuickActionCard;
