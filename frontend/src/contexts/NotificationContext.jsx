import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(undefined);

const api = axios.create({
  baseURL: 'http://localhost:3551/api/v1',
  withCredentials: true,
});

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [socket, setSocket] = useState(null);

  // 1. Load initial notifications from API
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
  }, [user]);

  // 2. Setup Socket.IO
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io('http://localhost:3551', {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('join', user._id);
    });

    newSocket.on('notification', (newNotif) => {
      console.log('Received notification:', newNotif);
      setNotifications(prev => [newNotif, ...prev]);
      
      // Trigger visual Toast notification
      addToast({
        title: newNotif.title,
        message: newNotif.body,
        type: newNotif.type === 'ERROR' ? 'error' : 'success'
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    try {
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      await api.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      await api.post('/notifications/mark-read');
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  // Toast functions
  const addToast = (toast) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, ...toast }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addNotification = (notification) => {
    // Trigger visual toast only (do not add transient notifications to the persistent DB list)
    addToast({
      title: notification.title || 'Notification',
      message: notification.message || notification.body,
      type: notification.type || 'success'
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
      
      {/* Toast Alert System Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`p-4 rounded-xl shadow-xl border text-white pointer-events-auto flex items-start justify-between gap-3 transition-all duration-300 transform translate-x-0 animate-in slide-in-from-right-5 duration-200 ${
              t.type === 'error'
                ? 'bg-red-600 border-red-500 dark:bg-red-700 dark:border-red-650'
                : t.type === 'warning'
                ? 'bg-amber-500 border-amber-400 dark:bg-amber-600 dark:border-amber-500'
                : 'bg-green-600 border-green-500 dark:bg-green-700 dark:border-green-650'
            }`}
          >
            <div className="flex-1">
              {t.title && <h4 className="font-bold text-sm">{t.title}</h4>}
              <p className="text-xs mt-0.5 opacity-90">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white hover:text-gray-200 transition-colors cursor-pointer focus:outline-none"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
export default NotificationContext;