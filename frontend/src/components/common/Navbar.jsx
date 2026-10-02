import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, Sun, Moon } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close notifications dropdown when clicking anywhere outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [notificationsOpen]);

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-white/90 dark:bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-[#E5E0D8] dark:border-[#222222] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-200">
      {/* Left Section: Mobile Menu Toggle & Community Name */}
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          className="p-2 rounded-xl text-[#555555] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F2ED] bg-white/70 dark:bg-[#141414]/80 hover:bg-[#F0EBE4] dark:hover:bg-[#1A1A1A] border border-[#B87333]/40 hover:border-[#B87333] transition-all cursor-pointer lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        {/* Community Name Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#B87333] animate-pulse" />
          <span className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F5F2ED] tracking-tight">
            {user?.communityName || 'Community Desk'}
          </span>
        </div>
      </div>

      {/* Right Section: Theme Toggle & Notifications */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Dark to Light Theme Toggle Button with Copper Border */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-[#555555] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F2ED] bg-white/70 dark:bg-[#141414]/80 hover:bg-[#F0EBE4] dark:hover:bg-[#1A1A1A] border border-[#B87333]/50 hover:border-[#B87333] transition-all cursor-pointer backdrop-blur-md"
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-[#E5A96A]" />
          ) : (
            <Moon size={18} className="text-[#B87333]" />
          )}
        </button>

        {/* Notifications Icon with Copper Border and click-away closing */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className={`p-2.5 rounded-xl bg-white/70 dark:bg-[#141414]/80 hover:bg-[#F0EBE4] dark:hover:bg-[#1A1A1A] border transition-all relative cursor-pointer backdrop-blur-md ${
              notificationsOpen
                ? 'border-[#B87333] text-[#B87333]'
                : 'border-[#B87333]/50 hover:border-[#B87333] text-[#555555] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F2ED]'
            }`}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#B87333] rounded-full animate-pulse" />
            )}
          </button>

          {notificationsOpen && (
            <NotificationDropdown onClose={() => setNotificationsOpen(false)} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
