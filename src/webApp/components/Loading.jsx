import React from 'react';

const Loading = ({ text = 'Завантаження...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-500">{text}</p>
    </div>
  );
};

export default Loading;