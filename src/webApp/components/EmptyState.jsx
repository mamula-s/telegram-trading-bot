import React from 'react';
import { Info } from 'lucide-react';

const EmptyState = ({ 
  title = 'Немає даних', 
  description = 'Поки що тут пусто',
  icon: Icon = Info,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-gray-100 p-3 rounded-full">
        <Icon className="w-8 h-8 text-gray-600" />
      </div>
      <h3 className="mt-4 font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-500">{description}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;