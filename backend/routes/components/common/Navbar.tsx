import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon from './Icon';
import Button from './Button';
import NotificationPanel from './NotificationPanel';

const Navbar: React.FC = () => {
  const { user, logout, notifications } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Close panel if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="h-9 w-9">
              <defs>
                <radialGradient id="appleGradient-nav" cx="40%" cy="40%" r="60%" fx="30%" fy="30%">
                  <stop offset="0%" stopColor="#FB923C" />
                  <stop offset="100%" stopColor="#EA580C" />
                </radialGradient>
                <linearGradient id="leafGradient-nav" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <filter id="shadow-nav" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2" />
                </filter>
              </defs>
              <g filter="url(#shadow-nav)">
                <path d="M 80,55 C 80,75 65,90 50,90 C 35,90 20,75 20,55 C 20,35 35,20 50,20 C 53,20 65,20 80,35 C 90,40 80,45 80,55 Z" fill="url(#appleGradient-nav)" />
                <path d="M 50,22 C 45,22 42,27 50,27 C 58,27 55,22 50,22 Z" fill="#C2410C" />
                <path d="M 50,88 C 47,88 45,85 50,85 C 55,85 53,88 50,88 Z" fill="#C2410C" />
                <path d="M 50,22 C 50,15 55,10 60,8 L 62,15 C 57,17 52,20 50,22 Z" fill="#78350F" />
                <path d="M 60,18 C 75,5 85,15 70,25 Z" fill="url(#leafGradient-nav)" />
              </g>
            </svg>
            <span className="text-2xl font-bold text-gray-800">NutriFlow</span>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <div className="relative" ref={panelRef}>
                <button onClick={() => setIsPanelOpen(!isPanelOpen)} className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
                  <Icon name="bell" className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                    </span>
                  )}
                </button>
                {isPanelOpen && <NotificationPanel onClose={() => setIsPanelOpen(false)} />}
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-500 capitalize">{user.role.toLowerCase()}</div>
              </div>
              <Button onClick={logout} variant="ghost" size="sm" className="flex items-center space-x-2">
                <Icon name="logout" className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;