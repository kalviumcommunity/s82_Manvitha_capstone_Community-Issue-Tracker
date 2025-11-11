import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import Cookies from 'js-cookie';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userName, setUserName] = useState('');

  // ✅ Read user info from cookies
  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      try {
        const user = JSON.parse(userCookie);
        setUserName(user.name || user.mail || 'User');
      } catch (e) {
        console.error('Error parsing user cookie:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    logout(); // clears cookies from AuthContext
  };

  return (
    <header className="h-16 px-4 lg:pl-72 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
        Community Issue Tracker
      </h1>

      <div className="flex items-center gap-4">
        {/* Show logged-in user */}
        {userName && (
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            Hi, {userName}
          </span>
        )}

      

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setNotificationsOpen(false)}
              />
              <NotificationDropdown onClose={() => setNotificationsOpen(false)} />
            </>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun size={20} className="text-gray-300" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
