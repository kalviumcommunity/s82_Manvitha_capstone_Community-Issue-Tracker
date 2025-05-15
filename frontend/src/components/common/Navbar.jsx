import React, { useState } from 'react';
import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const { logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-16 px-4 lg:pl-72 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Community Issue Tracker</h1>
      
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(prev => !prev)}
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

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Logout"
        >
          <LogOut size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
