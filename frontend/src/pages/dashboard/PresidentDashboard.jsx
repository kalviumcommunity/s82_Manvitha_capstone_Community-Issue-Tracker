import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, UserPlus, Bell, PlusCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import TicketCard from '../../components/tickets/TicketCard';
import AnnouncementBanner from '../../components/announcements/AnnouncementBanner';
import { useAuth } from '../../contexts/AuthContext';

const api = axios.create({
  baseURL: 'https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1',
  withCredentials: true,
});

const PresidentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({ residents: 0, issuesOpen: 0, pendingRequests: 0 });
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.communityId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const statsRes = await api.get(`/communities/${user.communityId}/stats`);
        setStats(statsRes.data);

        const ticketsRes = await api.get('/issues');
        setRecentTickets(ticketsRes.data.slice(0, 3));

        const announcementsRes = await api.get('/announcements');
        setRecentAnnouncements(announcementsRes.data.slice(0, 2));

      } catch (err) {
        console.error("Error loading admin dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-[#B87333]" size={36} />
      </div>
    );
  }

  if (!user?.communityId) {
    return (
      <div className="p-6 sm:p-10 max-w-xl mx-auto text-center mt-10">
        <div className="bg-white/90 dark:bg-[#121212]/95 border border-[#E5E0D8] dark:border-[#262626] rounded-3xl p-8 backdrop-blur-xl">
          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED] mb-3 font-serif">Welcome, {user?.name}!</h1>
          <p className="text-[#666666] dark:text-[#A0A0A0] text-sm mb-6">
            You haven't created or joined a community yet. Please create a community to get started as an Admin.
          </p>
          <button
            onClick={() => navigate('/create-community')}
            className="bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/60 hover:border-[#B87333] text-[#1A1A1A] dark:text-[#F5F2ED] font-semibold py-3 px-8 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md text-sm"
          >
            Create Community
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E5E0D8] dark:border-[#222222] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED] tracking-tight font-serif">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-[#888888] mt-1">
            {user?.communityName ? `${user.communityName} • Community Overview` : 'Community Overview'}
          </p>
        </div>

        {/* Quick Action Buttons with Copper Borders */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/president/announcements')}
            className="bg-gradient-to-r from-[#B87333]/20 via-[#FAF7F2] to-[#F2EDE3] dark:bg-none dark:bg-[#101010]/95 hover:dark:bg-[#161616] border border-[#B87333]/50 hover:border-[#B87333] text-[#1A1A1A] dark:text-[#F5F2ED] font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer backdrop-blur-md text-xs sm:text-sm"
          >
            <PlusCircle size={16} className="text-[#B87333] dark:text-[#E5A96A]" />
            Post Notice
          </button>
          <button
            onClick={() => navigate('/president/manage-community')}
            className="bg-white/80 dark:bg-none dark:bg-[#101010]/95 hover:bg-[#F2EDE3] hover:dark:bg-[#161616] border border-[#B87333]/40 hover:border-[#B87333] text-[#1A1A1A] dark:text-[#F5F2ED] font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer backdrop-blur-md text-xs sm:text-sm"
          >
            <Users size={16} className="text-[#B87333] dark:text-[#E5A96A]" />
            Manage Users
          </button>
        </div>
      </header>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 dark:bg-[#121212]/90 border border-[#E5E0D8] dark:border-[#222222] rounded-2xl p-4 sm:p-5 flex items-center backdrop-blur-md">
          <div className="rounded-xl h-12 w-12 flex items-center justify-center bg-[#B87333]/15 border border-[#B87333]/25 text-[#B87333] dark:text-[#E5A96A] mr-4 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#777777] dark:text-[#737373] uppercase tracking-wider">Total Users</p>
            <p className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED]">{stats.residents}</p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-[#121212]/90 border border-[#E5E0D8] dark:border-[#222222] rounded-2xl p-4 sm:p-5 flex items-center backdrop-blur-md">
          <div className="rounded-xl h-12 w-12 flex items-center justify-center bg-amber-500/15 border border-amber-500/25 text-amber-500 dark:text-amber-400 mr-4 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#777777] dark:text-[#737373] uppercase tracking-wider">Open Tickets</p>
            <p className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED]">{stats.issuesOpen}</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/president/manage-community', { state: { tab: 'approvals' } })}
          className="bg-white/80 dark:bg-[#121212]/90 border border-[#E5E0D8] dark:border-[#222222] hover:border-[#B87333] rounded-2xl p-4 sm:p-5 flex items-center cursor-pointer transition-all duration-200 backdrop-blur-md"
        >
          <div className={`rounded-xl h-12 w-12 flex items-center justify-center mr-4 shrink-0 ${
            stats.pendingRequests > 0 
              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 animate-pulse' 
              : 'bg-[#F2EDE3] dark:bg-[#1E1E1E] border border-[#E5E0D8] dark:border-[#2E2E2E] text-[#888888] dark:text-[#737373]'
          }`}>
            <UserPlus size={22} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#777777] dark:text-[#737373] uppercase tracking-wider">Pending Join Requests</p>
            <p className="text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED]">{stats.pendingRequests}</p>
          </div>
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F5F2ED] tracking-tight">Recent Community Tickets</h2>
          <button
            onClick={() => navigate('/president/tickets')}
            className="text-xs font-semibold text-[#B87333] hover:text-[#C98545] transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>
        {recentTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentTickets.map(ticket => (
              <TicketCard key={ticket._id} ticket={ticket} compact />
            ))}
          </div>
        ) : (
          <div className="bg-white/60 dark:bg-[#121212]/70 rounded-2xl p-8 text-center border border-dashed border-[#E5E0D8] dark:border-[#262626]">
            <p className="text-sm text-[#777777] dark:text-[#737373]">No tickets reported yet.</p>
          </div>
        )}
      </div>

      {/* Announcements Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#B87333]" />
            <h2 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F5F2ED] tracking-tight">Recent Announcements</h2>
          </div>
          <button
            onClick={() => navigate('/president/announcements')}
            className="text-xs font-semibold text-[#B87333] hover:text-[#C98545] transition-colors cursor-pointer"
          >
            Manage Announcements
          </button>
        </div>

        <div className="space-y-3">
          {recentAnnouncements.length > 0 ? (
            recentAnnouncements.map(announcement => (
              <AnnouncementBanner
                key={announcement._id}
                announcement={{
                  ...announcement,
                  content: announcement.body,
                  important: announcement.pinned
                }}
              />
            ))
          ) : (
            <div className="bg-white/60 dark:bg-[#121212]/70 rounded-2xl p-8 text-center border border-dashed border-[#E5E0D8] dark:border-[#262626]">
              <p className="text-sm text-[#777777] dark:text-[#737373]">No announcements posted yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresidentDashboard;
