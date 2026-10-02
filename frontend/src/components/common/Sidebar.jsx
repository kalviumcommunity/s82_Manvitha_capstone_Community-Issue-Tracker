import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  PlusCircle,
  X,
  LogOut,
  Loader2,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SidebarLink = ({ to, icon, text, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
        isActive
          ? 'bg-[#B87333]/15 dark:bg-[#B87333]/20 border border-[#B87333]/50 text-[#8B4513] dark:text-[#F5F2ED] backdrop-blur-md font-semibold'
          : 'text-[#555555] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F2ED] hover:bg-[#F2EDE5] dark:hover:bg-[#1A1A1A]/80 border border-transparent'
      }`
    }
  >
    {icon}
    <span>{text}</span>
  </NavLink>
);

const roleLinks = {
  PRESIDENT: [
    { to: '/president/dashboard', icon: <Home size={18} />, text: 'Dashboard' },
    { to: '/president/tickets', icon: <MessageSquare size={18} />, text: 'All Tickets' },
    { to: '/president/announcements', icon: <MessageSquare size={18} />, text: 'Announcements' },
    { to: '/president/manage-community', icon: <Users size={18} />, text: 'Manage Community' },
  ],
  RESIDENT: [
    { to: '/resident/dashboard', icon: <Home size={18} />, text: 'Dashboard' },
    { to: '/resident/new-ticket', icon: <PlusCircle size={18} />, text: 'New Ticket' },
    { to: '/resident/my-tickets', icon: <MessageSquare size={18} />, text: 'My Tickets' },
    { to: '/resident/announcements', icon: <MessageSquare size={18} />, text: 'Announcements' },
  ],
};

const Sidebar = () => {
  const { user, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <aside className="fixed top-0 left-0 h-full w-64 bg-white/95 dark:bg-[#0D0D0D] border-r border-[#E5E0D8] dark:border-[#262626] z-40 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-7 w-7 text-[#B87333]" />
        <p className="mt-2 text-xs text-[#777777] dark:text-[#737373]">Loading workspace...</p>
      </aside>
    );
  }

  if (!user) return null;

  const links = user.role === 'RESIDENT' && !user.communityId
    ? [{ to: '/resident/dashboard', icon: <Home size={18} />, text: 'Dashboard' }]
    : (roleLinks[user.role] || []);

  const roleDisplay = user.role === 'PRESIDENT' ? 'Admin' : 'User';
  const isProfileActive = location.pathname === '/profile';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white/95 dark:bg-[#0D0D0D]/95 backdrop-blur-2xl border-r border-[#E5E0D8] dark:border-[#222222] z-40 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Close Button */}
        <div className="p-3 flex justify-end lg:hidden">
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
            className="p-2 rounded-xl text-[#777777] dark:text-[#737373] hover:text-[#1A1A1A] dark:hover:text-[#F5F2ED] hover:bg-[#F2EDE5] dark:hover:bg-[#1A1A1A] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Highlighted User Profile Card with Copper Border & Glow */}
        <Link
          to="/profile"
          onClick={() => setIsOpen(false)}
          className={`group p-3.5 mx-3 mt-3 lg:mt-4 rounded-2xl transition-all duration-300 block backdrop-blur-xl ${
            isProfileActive
              ? 'bg-gradient-to-br from-[#B87333]/20 via-[#FDFBF7] to-[#F5F0E6] dark:from-[#B87333]/30 dark:via-[#B87333]/20 dark:to-[#171717]/95 border border-[#B87333] ring-1 ring-[#B87333]/50'
              : 'bg-gradient-to-br from-[#B87333]/15 via-[#FAF7F2] to-[#F2EDE3] dark:from-[#B87333]/15 dark:via-[#1A1A1A]/85 dark:to-[#141414]/90 border border-[#B87333]/50 hover:border-[#B87333] hover:from-[#B87333]/25'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={
                  user.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1E1E1E&color=E5A96A&size=80`
                }
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#B87333]/80 ring-offset-2 ring-offset-white dark:ring-offset-[#0D0D0D] transition-transform duration-200 group-hover:scale-105"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0D0D0D]" />
            </div>

            <div className="overflow-hidden min-w-0 flex-1">
              <p className="font-semibold text-xs sm:text-sm text-[#1A1A1A] dark:text-[#F5F2ED] truncate tracking-tight group-hover:text-[#B87333] dark:group-hover:text-white transition-colors">
                {user.name}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#B87333]/25 border border-[#B87333]/50 text-[#8B4513] dark:text-[#E5A96A] text-[10px] font-bold uppercase tracking-wider">
                  {roleDisplay}
                </span>
              </div>
            </div>

            <ChevronRight size={15} className="text-[#B87333] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {links.map((link) => (
            <SidebarLink
              key={link.to}
              to={link.to}
              icon={link.icon}
              text={link.text}
              onClick={() => setIsOpen(false)}
            />
          ))}
        </nav>

        {/* Footer with Logout - Glassy finish with zero shadows */}
        <div className="p-3 border-t border-[#E5E0D8] dark:border-[#222222]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#666666] dark:text-[#888888] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
