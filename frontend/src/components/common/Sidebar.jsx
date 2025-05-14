import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BarChart2, 
  MessageSquare, 
  Bell, 
  PlusCircle, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  AlertTriangle, 
  User,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SidebarLink = ({ to, icon, text }) => {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => 
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive 
            ? 'bg-blue-500 text-white' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`
      }
    >
      {icon}
      <span className="font-medium">{text}</span>
    </NavLink>
  );
};

const roleLinks = {
  'president': [
    { to: '/president', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/president/tickets', icon: <MessageSquare size={20} />, text: 'All Tickets' },
    { to: '/president/analytics', icon: <BarChart2 size={20} />, text: 'Analytics' },
    { to: '/president/announcements', icon: <Bell size={20} />, text: 'Announcements' },
  ],
  'vice-president': [
    { to: '/vice-president', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/vice-president/urgent', icon: <AlertTriangle size={20} />, text: 'Urgent Tickets' },
    { to: '/vice-president/assigned', icon: <User size={20} />, text: 'Assigned to Me' },
  ],
  'resident': [
    { to: '/resident', icon: <Home size={20} />, text: 'Dashboard' },
    { to: '/resident/new-ticket', icon: <PlusCircle size={20} />, text: 'New Ticket' },
    { to: '/resident/my-tickets', icon: <MessageSquare size={20} />, text: 'My Tickets' },
    { to: '/resident/announcements', icon: <Bell size={20} />, text: 'Announcements' },
  ]
};

const Sidebar = () => {
  const { user, logout, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const links = roleLinks[user.role];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
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
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Community Hub</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <X size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`} 
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {links.map(link => (
              <SidebarLink 
                key={link.to} 
                to={link.to} 
                icon={link.icon} 
                text={link.text} 
              />
            ))}
          </nav>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Demo: Switch Role</div>
            <div className="flex flex-wrap gap-2">
              {['president', 'vice-president', 'resident'].map(role => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className={`px-2 py-1 text-xs rounded ${
                    user.role === role
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 w-full transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
