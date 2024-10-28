import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorView = ({ message = 'Щось пішло не так', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-red-100 p-3 rounded-full">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <p className="mt-4 text-gray-600 text-center">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Спробувати знову
        </button>
      )}
    </div>
  );
};

export default ErrorView;