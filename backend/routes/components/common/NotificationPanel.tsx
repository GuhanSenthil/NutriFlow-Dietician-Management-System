import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Icon from './Icon';
import { Notification } from '../../types';

interface NotificationPanelProps {
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
    const { notifications, markNotificationsAsRead } = useAuth();
    const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp);
    const unreadCount = notifications.filter(n => !n.read).length;

    const getIconForType = (type: Notification['type']) => {
        switch (type) {
            case 'application': return 'user';
            case 'broadcast': return 'send';
            default: return 'info';
        }
    };

    const handleMarkAllRead = async () => {
        if (unreadCount > 0) {
            await markNotificationsAsRead();
        }
    };
    
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border z-40 animate-fade-in">
            <div className="p-3 flex justify-between items-center border-b">
                <h3 className="text-sm font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:underline">
                        Mark all as read
                    </button>
                )}
            </div>
            <div className="max-h-80 overflow-y-auto">
                {sortedNotifications.length > 0 ? (
                    <ul>
                        {sortedNotifications.map(n => (
                            <li key={n.id} className={`p-3 border-b flex items-start space-x-3 hover:bg-gray-50 ${!n.read ? 'bg-primary-50' : ''}`}>
                                <Icon name={getIconForType(n.type)} className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-700">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(n.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-500 p-4 text-center">No notifications yet.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;