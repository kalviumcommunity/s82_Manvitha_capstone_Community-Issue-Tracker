import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
// import axios from 'axios'; // Unused
import {
  Home,
  MessageSquare,
  Bell,
  PlusCircle,
  Menu,
  X,
  LogOut,
  Loader2,
  Users,
  User,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

// axios.defaults.withCredentials = true; // Handled in AuthContext endpoint calls or global config

const SidebarLink = ({ to, icon, text }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
        ? 'bg-blue-500 text-white shadow'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`
    }
  >
    {icon}
    <span className="font-medium">{text}</span>
  </NavLink>
);

const roleLinks = {
  PRESIDENT: [
    { to: '/president/dashboard', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/president/tickets', icon: <MessageSquare size={20} />, text: 'All Tickets' },
    { to: '/president/announcements', icon: <Bell size={20} />, text: 'Announcements' },
    { to: '/president/manage-community', icon: <Users size={20} />, text: 'Manage Community' },
  ],
  RESIDENT: [
    { to: '/resident/dashboard', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/resident/new-ticket', icon: <PlusCircle size={20} />, text: 'New Ticket' },
    { to: '/resident/my-tickets', icon: <MessageSquare size={20} />, text: 'My Tickets' },
    { to: '/resident/announcements', icon: <Bell size={20} />, text: 'Announcements' },
  ],
};

const Sidebar = () => {
  const { user, loading, logout } = useAuth(); // Use context
  // const [user, setUser] = useState(null); // Removed
  // const [loading, setLoading] = useState(true); // Removed
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // useEffect for fetching user REMOVED - AuthContext handles it

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-40 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <p className="mt-2 text-gray-500 dark:text-gray-400">Loading...</p>
      </aside>
    );
  }

  if (!user) return null;

  const links = roleLinks[user.role] || [];

  return (
    <>
      {/* Hamburger for mobile */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open sidebar"
        className="fixed top-4 left-4 z-20 p-2 rounded-md bg-white dark:bg-gray-800 shadow lg:hidden"
      >
        <Menu size={24} className="text-gray-700 dark:text-gray-200" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              Community Hub
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <X size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <Link
            to="/profile"
            onClick={() => setIsOpen(false)}
            className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors block"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`
                }
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="overflow-hidden">
                <p className="font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          </Link>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {links.map((link) => (
              <SidebarLink key={link.to} to={link.to} icon={link.icon} text={link.text} />
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;