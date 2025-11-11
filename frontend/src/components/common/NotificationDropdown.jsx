import React, { useEffect, useState } from 'react';
import { Check, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // ✅ Load notifications from cookies
  useEffect(() => {
    const stored = Cookies.get('notifications');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (err) {
        console.error('Invalid notifications cookie:', err);
      }
    }
  }, []);

  // ✅ Mark single notification as read
  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    Cookies.set('notifications', JSON.stringify(updated), { expires: 7 });
  };

  // ✅ Mark all as read
  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    Cookies.set('notifications', JSON.stringify(updated), { expires: 7 });
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    onClose();
    if (notification.linkTo) {
      navigate(notification.linkTo);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-30">
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          <Bell size={24} className="mx-auto mb-2 opacity-50" />
          <p>No notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 z-30">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-medium text-gray-800 dark:text-white">Notifications</h3>
        <button 
          onClick={() => {
            markAllAsRead();
            onClose();
          }}
          className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-400"
        >
          Mark all as read
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.map(notification => (
          <div 
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
              notification.read 
                ? 'bg-white dark:bg-gray-800' 
                : 'bg-blue-50 dark:bg-gray-700'
            } hover:bg-gray-50 dark:hover:bg-gray-700`}
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                )}
              </div>
              
              <div className="flex-grow">
                <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'font-medium text-gray-800 dark:text-white'}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
              
              {notification.read && (
                <button
                  className="flex-shrink-0 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDropdown;
