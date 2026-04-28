import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  // FIX: Added onClick prop to allow the card to be clickable.
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, icon, actions, onClick }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`} onClick={onClick}>
      {(title || actions) && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {title && (
            <div className="flex items-center space-x-2">
              {icon}
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            </div>
          )}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Card;