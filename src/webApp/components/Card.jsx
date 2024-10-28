import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  onClick, 
  gradient,
  padding = 'p-4' 
}) => {
  const baseClasses = 'rounded-2xl shadow-sm';
  const gradientClasses = gradient 
    ? `bg-gradient-to-r ${gradient}` 
    : 'bg-white';
  
  return (
    <div 
      className={`${baseClasses} ${gradientClasses} ${padding} ${className} ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;