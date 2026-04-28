import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppUser, Notification } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  notifications: Notification[];
  markNotificationsAsRead: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications periodically
  const fetchNotifications = useCallback(async () => {
    if (user) {
      try {
        const userNotifications = await api.getNotifications(user.id);
        setNotifications(userNotifications);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications(); // Initial fetch
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);


  useEffect(() => {
    setLoading(true);
    try {
      const savedUserJSON = localStorage.getItem('nutriflow_user');
      if (savedUserJSON) {
        const savedUser = JSON.parse(savedUserJSON);
        setUserState(savedUser);
      }
    } catch (error) {
      console.error("Could not rehydrate user from localStorage", error);
      localStorage.removeItem('nutriflow_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const setUser = useCallback((userToSet: AppUser | null) => {
    if (userToSet) {
      localStorage.setItem('nutriflow_user', JSON.stringify(userToSet));
    } else {
      localStorage.removeItem('nutriflow_user');
      setNotifications([]); // Clear notifications on logout
    }
    setUserState(userToSet);
  }, []);

  const logout = useCallback(async () => {
    await api.signOut(); 
    setUser(null);
  }, [setUser]);

  const refreshUser = useCallback(async () => {
    if (user) {
        try {
            const freshUser = await api.getUser(user.id);
            if (freshUser) {
                setUser(freshUser);
            } else {
                await logout();
            }
        } catch (error) {
            console.error("Failed to refresh user data", error);
            await logout();
        }
    }
  }, [user, setUser, logout]);

  const markNotificationsAsRead = useCallback(async () => {
    if (user) {
        try {
            await api.markNotificationsAsRead(user.id);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
        }
    }
  }, [user]);


  const value = { user, loading, setUser, logout, refreshUser, notifications, markNotificationsAsRead };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
