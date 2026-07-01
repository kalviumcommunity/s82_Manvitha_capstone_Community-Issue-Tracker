import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, UserPlus, Bell, PlusCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import TicketCard from '../../components/tickets/TicketCard';
import AnnouncementBanner from '../../components/announcements/AnnouncementBanner';
import { useAuth } from '../../contexts/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:3551/api/v1',
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
      // If user is loaded but has no communityId, stop loading and return
      if (!user?.communityId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Fetch Stats
        const statsRes = await api.get(`/communities/${user.communityId}/stats`);
        setStats(statsRes.data);

        // 2. Fetch Recent Tickets
        const ticketsRes = await api.get('/issues');
        setRecentTickets(ticketsRes.data.slice(0, 3));

        // 3. Fetch Recent Announcements
        const announcementsRes = await api.get('/announcements');
        setRecentAnnouncements(announcementsRes.data.slice(0, 2));

      } catch (err) {
        console.error("Error loading dashboard data:", err);
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
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!user?.communityId) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome, {user?.name}!</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You haven't created or joined a community yet. Please create a community to get started.
        </p>
        <button
          onClick={() => navigate('/create-community')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition"
        >
          Create Community
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Admin Dashboard: {user?.communityName || 'Community Overview'}
      </h1>

      {/* Quick stats from Backend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Residents</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.residents}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400 mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Issues</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.issuesOpen}</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/president/manage-community', { state: { tab: 'approvals' } })}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center cursor-pointer hover:shadow-md transition-shadow duration-200 border border-transparent hover:border-amber-200 dark:hover:border-amber-900"
        >
          <div className={`rounded-full h-12 w-12 flex items-center justify-center mr-4 ${
            stats.pendingRequests > 0 
              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse' 
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approvals</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.pendingRequests}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Tickets Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Tickets</h2>
          <button
            onClick={() => navigate('/president/tickets')}
            className="text-sm text-blue-600 hover:underline"
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
          <p className="text-gray-500 italic">No tickets reported yet.</p>
        )}
      </div>

      {/* Announcements Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Announcements</h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate('/president/announcements')}
              className="text-sm text-blue-600 hover:underline"
            >
              View All
            </button>
            <button
              onClick={() => navigate('/president/announcements')}
              className="flex items-center text-sm text-green-600 hover:underline"
            >
              <PlusCircle size={14} className="mr-1" />
              New
            </button>
          </div>
        </div>

        <div className="space-y-4">
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
            <p className="text-gray-500 italic">No announcements posted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresidentDashboard;