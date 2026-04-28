
import React, { useEffect, useState } from 'react';
import Icon from './Icon';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      // Allow time for fade-out animation before calling onClose
      setTimeout(onClose, 300);
    }, 2700);
    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = 'flex items-center p-4 rounded-lg shadow-lg text-white transition-all duration-300 transform';
  
  const typeClasses = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const iconName = {
    success: 'check',
    error: 'x',
    info: 'info',
  };

  const combinedClasses = `${baseClasses} ${typeClasses[type]} ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`;

  return (
    <div className={combinedClasses}>
      <Icon name={iconName[type]} className="h-6 w-6 mr-3" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20">
        <Icon name="x" className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
