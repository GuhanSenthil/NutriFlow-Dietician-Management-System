
import React from 'react';
import Icon from './Icon';

interface EmptyStateProps {
  iconName: string;
  message: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ iconName, message, description }) => {
  return (
    <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
      <div className="flex justify-center items-center mx-auto h-12 w-12 rounded-full bg-primary-100">
        <Icon name={iconName} className="h-6 w-6 text-primary-600" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{message}</h3>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  );
};

export default EmptyState;
