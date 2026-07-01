import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MessageSquare, Clock, Bell, CheckCircle2, Loader2, RefreshCw, XCircle, Home } from 'lucide-react';
import axios from 'axios';
import TicketCard from '../../components/tickets/TicketCard';
import AnnouncementBanner from '../../components/announcements/AnnouncementBanner';
import { useAuth } from '../../contexts/AuthContext';

const api = axios.create({
  baseURL: 'https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1',
  withCredentials: true,
});

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for when communityId is missing
  const [communities, setCommunities] = useState([]);
  const [selectedCommId, setSelectedCommId] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.communityId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // 1. Fetch user's own tickets
        const ticketsRes = await api.get('/issues/my');
        setTickets(ticketsRes.data);

        // 2. Fetch community announcements
        const announcementsRes = await api.get('/announcements');
        setAnnouncements(announcementsRes.data);
      } catch (err) {
        console.error("Error loading resident dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (user && !user.communityId) {
      const fetchPublicCommunities = async () => {
        try {
          const res = await api.get('/communities/public');
          setCommunities(res.data);
        } catch (err) {
          console.error("Error fetching communities:", err);
        }
      };
      fetchPublicCommunities();
    }
  }, [user]);

  const handleCheckStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error("Failed to check status:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleCancelRequest = async (approvalId) => {
    if (!window.confirm("Are you sure you want to cancel your join request?")) return;
    try {
      setCancelLoading(true);
      await api.delete(`/approvals/${approvalId}`);
      // Refresh user context
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error("Failed to cancel request:", err);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRequestJoin = async (e) => {
    e.preventDefault();
    if (!selectedCommId) return;
    try {
      setSubmitLoading(true);
      await api.post('/approvals/join', { communityId: selectedCommId });
      // Refresh user context
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error("Failed to submit request:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // Render pending / choice / rejected screens if no community
  if (!user?.communityId) {
    const lastApproval = user?.lastApproval;

    if (lastApproval && lastApproval.status === 'PENDING') {
      return (
        <div className="p-6 max-w-2xl mx-auto mt-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-150 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-amber-50 dark:bg-amber-950/20 p-8 text-center border-b border-gray-100 dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4 animate-pulse">
                <Clock size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Pending Approval</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
                Your request to join the community has been received and is awaiting approval from the community President.
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border dark:border-gray-700 space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">Request Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider block mb-0.5">Selected Community</span>
                    <p className="font-medium text-gray-900 dark:text-white">{lastApproval.communityId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider block mb-0.5">Location</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {lastApproval.communityId?.location?.city || 'N/A'}, {lastApproval.communityId?.location?.state || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider block mb-0.5">Request Date</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {lastApproval.createdAt ? new Date(lastApproval.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase tracking-wider block mb-0.5">Verification Status</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      <span className="font-medium text-amber-600 dark:text-amber-400 text-xs">PENDING</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleCheckStatus}
                  disabled={statusLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-750 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  {statusLoading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                  Check Approval Status
                </button>
                <button
                  onClick={() => handleCancelRequest(lastApproval._id)}
                  disabled={cancelLoading}
                  className="flex-1 bg-gray-100 hover:bg-gray-205 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {cancelLoading ? <Loader2 className="animate-spin" size={20} /> : <XCircle size={20} />}
                  Cancel Request
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (lastApproval && lastApproval.status === 'REJECTED') {
      return (
        <div className="p-6 max-w-2xl mx-auto mt-10">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-150 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-red-50 dark:bg-red-950/20 p-8 text-center border-b border-gray-100 dark:border-gray-700">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-105 dark:bg-red-900/30 text-red-650 dark:text-red-400 mb-4 animate-bounce">
                <XCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Declined</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
                Your request to join **{lastApproval.communityId?.name || 'the community'}** was declined by the President.
              </p>
              {lastApproval.note && (
                <div className="mt-4 p-3 bg-red-100/50 dark:bg-red-900/10 text-red-800 dark:text-red-300 text-sm rounded-lg border border-red-200/50 dark:border-red-900/30 italic max-w-md mx-auto">
                  Reason: "{lastApproval.note}"
                </div>
              )}
            </div>

            <div className="p-8">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4 font-sans">Choose another community to join:</h3>
              <form onSubmit={handleRequestJoin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Community:</label>
                  <select
                    value={selectedCommId}
                    onChange={e => setSelectedCommId(e.target.value)}
                    required
                    className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="" disabled>-- Choose a Community --</option>
                    {communities.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.location?.city || 'Unknown City'})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading || !selectedCommId}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  {submitLoading ? <Loader2 className="animate-spin" size={20} /> : <Home size={20} />}
                  Submit Join Request
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }

    // Default: choose a community
    return (
      <div className="p-6 max-w-2xl mx-auto mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-150 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-blue-50 dark:bg-blue-955/20 p-8 text-center border-b border-gray-100 dark:border-gray-700">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              <Home size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Join a Community</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-sm">
              Please choose a community to join. Once you request membership, the President will verify your request.
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleRequestJoin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Community:</label>
                <select
                  value={selectedCommId}
                  onChange={e => setSelectedCommId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-xl dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="" disabled>-- Choose a Community --</option>
                  {communities.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.location?.city || 'Unknown City'})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitLoading || !selectedCommId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                {submitLoading ? <Loader2 className="animate-spin" size={20} /> : <Home size={20} />}
                Submit Join Request
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats from live data
  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  const activeTickets = tickets.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED');
  const recentActivity = [...tickets].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3);

  return (
    <div className="p-4 lg:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, {user?.name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Here is what's happening in your community.</p>
      </header>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => navigate('/resident/new-ticket')}
          className="bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-xl shadow-sm p-6 flex items-center group cursor-pointer"
        >
          <div className="rounded-full bg-white/20 p-3 mr-4 group-hover:scale-110 transition-transform">
            <PlusCircle size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg">Report an Issue</h3>
            <p className="text-blue-100 text-sm">Need help with something? Let us know.</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/resident/my-tickets')}
          className="bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-xl shadow-sm p-6 flex items-center group cursor-pointer"
        >
          <div className="rounded-full bg-white/20 p-3 mr-4 group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg">My Tickets</h3>
            <p className="text-indigo-100 text-sm">Track progress of your requests.</p>
          </div>
        </button>
      </div>

      {/* Live Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 flex items-center">
          <div className="rounded-full h-10 w-10 flex items-center justify-center bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 mr-3">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Open</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{openCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 flex items-center">
          <div className="rounded-full h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/30 mr-3">
            <Loader2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 flex items-center">
          <div className="rounded-full h-10 w-10 flex items-center justify-center bg-green-100 text-green-600 dark:bg-green-900/30 mr-3">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      {announcements.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Bell size={18} className="text-blue-500 mr-2" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Announcements</h2>
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 3).map(announcement => (
              <AnnouncementBanner
                key={announcement._id}
                announcement={{
                  ...announcement,
                  content: announcement.body,
                  important: announcement.pinned
                }}
              />
            ))}
            {announcements.length > 3 && (
              <button
                onClick={() => navigate('/resident/announcements')}
                className="w-full py-2 text-center text-sm text-blue-600 hover:text-blue-700 font-medium bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                View All ({announcements.length}) Announcements
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Tickets List */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Your Active Tickets</h2>
          <button onClick={() => navigate('/resident/my-tickets')} className="text-sm text-blue-600 hover:underline cursor-pointer">View All</button>
        </div>

        {activeTickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
            <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-gray-500">All caught up! No active issues reported.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTickets.slice(0, 4).map(ticket => (
              <TicketCard key={ticket._id} ticket={ticket} compact />
            ))}
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      {recentActivity.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-6">
            {recentActivity.map((ticket) => (
              <div key={ticket._id} className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-700 pb-2 last:pb-0">
                <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${ticket.status === 'OPEN' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                <p className="text-xs text-gray-400 mb-1">{new Date(ticket.updatedAt).toLocaleDateString()}</p>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{ticket.title}</h4>
                <p className="text-xs text-gray-500 mt-1">Status updated to <span className="text-blue-500 font-medium">{ticket.status.replace('_', ' ')}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;
