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
        const ticketsRes = await api.get('/issues/my');
        setTickets(ticketsRes.data);

        const announcementsRes = await api.get('/announcements');
        setAnnouncements(announcementsRes.data);
      } catch (err) {
        console.error("Error loading user dashboard:", err);
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
        <Loader2 className="animate-spin text-[#B87333]" size={36} />
      </div>
    );
  }

  // Render pending / choice / rejected screens if no community
  if (!user?.communityId) {
    const lastApproval = user?.lastApproval;

    if (lastApproval && lastApproval.status === 'PENDING') {
      return (
        <div className="p-4 lg:p-8 max-w-2xl mx-auto mt-6">
          <div className="bg-white dark:bg-[#121212]/95 border border-[#E5E0D8] dark:border-[#262626] rounded-3xl overflow-hidden backdrop-blur-xl">
            <div className="bg-amber-500/10 p-8 text-center border-b border-[#E5E0D8] dark:border-[#262626]">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-400 mb-4 animate-pulse">
                <Clock size={30} />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED] mb-2 font-serif">Request Pending Approval</h2>
              <p className="text-[#666666] dark:text-[#A0A0A0] max-w-md mx-auto text-xs sm:text-sm">
                Your request to join the community has been received and is awaiting approval from the community Admin.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="bg-[#FAF7F2] dark:bg-[#171717]/80 p-5 rounded-2xl border border-[#E5E0D8] dark:border-[#262626] space-y-4">
                <h3 className="font-semibold text-xs text-[#1A1A1A] dark:text-[#F5F2ED] uppercase tracking-wider border-b border-[#E5E0D8] dark:border-[#262626] pb-2">Request Details</h3>
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-[#888888] dark:text-[#737373] text-[11px] uppercase tracking-wider block mb-0.5">Selected Community</span>
                    <p className="font-medium text-[#1A1A1A] dark:text-[#F5F2ED]">{lastApproval.communityId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#888888] dark:text-[#737373] text-[11px] uppercase tracking-wider block mb-0.5">Location</span>
                    <p className="font-medium text-[#1A1A1A] dark:text-[#F5F2ED]">
                      {lastApproval.communityId?.location?.city || 'N/A'}, {lastApproval.communityId?.location?.state || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#888888] dark:text-[#737373] text-[11px] uppercase tracking-wider block mb-0.5">Request Date</span>
                    <p className="font-medium text-[#1A1A1A] dark:text-[#F5F2ED]">
                      {lastApproval.createdAt ? new Date(lastApproval.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#888888] dark:text-[#737373] text-[11px] uppercase tracking-wider block mb-0.5">Verification Status</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      <span className="font-semibold text-amber-500 dark:text-amber-400 text-xs">PENDING</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glassy action buttons with Copper Border */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCheckStatus}
                  disabled={statusLoading}
                  className="flex-1 bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/60 hover:border-[#B87333] text-[#1A1A1A] dark:text-[#F5F2ED] font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md text-sm"
                >
                  {statusLoading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                  Check Approval Status
                </button>
                <button
                  onClick={() => handleCancelRequest(lastApproval._id)}
                  disabled={cancelLoading}
                  className="flex-1 bg-[#FAF7F2] dark:bg-[#1A1A1A]/80 hover:bg-[#F0EBE4] dark:hover:bg-[#222222] border border-[#D5CEC2] dark:border-[#292929] hover:border-rose-500/60 text-[#666666] dark:text-[#A0A0A0] hover:text-rose-600 dark:hover:text-rose-400 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md text-sm"
                >
                  {cancelLoading ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
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
        <div className="p-4 lg:p-8 max-w-2xl mx-auto mt-6">
          <div className="bg-white dark:bg-[#121212]/95 border border-[#E5E0D8] dark:border-[#262626] rounded-3xl overflow-hidden backdrop-blur-xl">
            <div className="bg-rose-500/10 p-8 text-center border-b border-[#E5E0D8] dark:border-[#262626]">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-400 mb-4 animate-bounce">
                <XCircle size={30} />
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED] mb-2 font-serif">Request Declined</h2>
              <p className="text-[#666666] dark:text-[#A0A0A0] max-w-md mx-auto text-xs sm:text-sm">
                Your request to join <strong className="text-[#1A1A1A] dark:text-[#F5F2ED]">{lastApproval.communityId?.name || 'the community'}</strong> was declined by the Admin.
              </p>
              {lastApproval.note && (
                <div className="mt-4 p-3 bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs rounded-xl border border-rose-500/20 italic max-w-md mx-auto">
                  Reason: "{lastApproval.note}"
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <h3 className="font-semibold text-sm text-[#1A1A1A] dark:text-[#F5F2ED] mb-3">Choose another community to join:</h3>
              <form onSubmit={handleRequestJoin} className="space-y-4">
                <div>
                  <select
                    value={selectedCommId}
                    onChange={e => setSelectedCommId(e.target.value)}
                    required
                    className="w-full px-4 py-3 border rounded-xl bg-[#FAF7F2] dark:bg-[#171717] text-[#1A1A1A] dark:text-[#F5F2ED] border-[#D5CEC2] dark:border-[#292929] focus:border-[#B87333] outline-none text-sm cursor-pointer"
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
                  className="w-full bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/60 hover:border-[#B87333] text-[#1A1A1A] dark:text-[#F5F2ED] font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md text-sm"
                >
                  {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <Home size={18} />}
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
      <div className="p-4 lg:p-8 max-w-2xl mx-auto mt-6">
        <div className="bg-white dark:bg-[#121212]/95 border border-[#E5E0D8] dark:border-[#262626] rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="bg-[#B87333]/10 p-8 text-center border-b border-[#E5E0D8] dark:border-[#262626]">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#B87333]/15 border border-[#B87333]/30 text-[#B87333] mb-4">
              <Home size={30} />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED] mb-2 font-serif">Join a Community</h2>
            <p className="text-[#666666] dark:text-[#A0A0A0] max-w-md mx-auto text-xs sm:text-sm">
              Please choose a community to join. Once you request membership, the Admin will verify your request.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleRequestJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#777777] dark:text-[#A0A0A0] mb-2 uppercase tracking-wider">Select Community:</label>
                <select
                  value={selectedCommId}
                  onChange={e => setSelectedCommId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-xl bg-[#FAF7F2] dark:bg-[#171717] text-[#1A1A1A] dark:text-[#F5F2ED] border-[#D5CEC2] dark:border-[#292929] focus:border-[#B87333] outline-none text-sm cursor-pointer"
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
                className="w-full bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/60 hover:border-[#B87333] text-[#1A1A1A] dark:text-[#F5F2ED] font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md text-sm"
              >
                {submitLoading ? <Loader2 className="animate-spin" size={18} /> : <Home size={18} />}
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <header className="border-b border-[#E5E0D8] dark:border-[#222222] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED] tracking-tight font-serif">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-[#888888] mt-1">
            Overview of your active community tickets and announcements.
          </p>
        </div>
      </header>

      {/* Action Buttons with Crisp Copper Borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/resident/new-ticket')}
          className="bg-gradient-to-br from-[#B87333]/10 via-[#FDFBF7] to-[#F5F0E6] dark:bg-none dark:bg-[#101010]/95 hover:dark:bg-[#161616] backdrop-blur-xl border border-[#B87333]/50 hover:border-[#B87333] transition-all duration-300 rounded-2xl p-5 sm:p-6 flex items-center group cursor-pointer text-left"
        >
          <div className="rounded-xl bg-[#B87333]/15 dark:bg-[#181818] border border-[#B87333]/35 dark:border-[#2A2A2A] group-hover:dark:border-[#B87333]/50 p-3.5 mr-4 group-hover:scale-105 transition-transform text-[#B87333] dark:text-[#E5A96A] shrink-0">
            <PlusCircle size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-[#1A1A1A] dark:text-[#F5F2ED] tracking-wide">Report an Issue</h3>
            <p className="text-xs sm:text-sm text-[#666666] dark:text-[#A0A0A0]">Need help with something? Submit a new ticket.</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/resident/my-tickets')}
          className="bg-white/80 dark:bg-none dark:bg-[#101010]/95 hover:bg-[#FAF7F2] hover:dark:bg-[#161616] backdrop-blur-xl border border-[#B87333]/40 hover:border-[#B87333] transition-all duration-300 rounded-2xl p-5 sm:p-6 flex items-center group cursor-pointer text-left"
        >
          <div className="rounded-xl bg-[#FAF7F2] dark:bg-[#181818] border border-[#E5E0D8] dark:border-[#2A2A2A] group-hover:dark:border-[#B87333]/50 p-3.5 mr-4 group-hover:scale-105 transition-transform text-[#B87333] dark:text-[#E5A96A] shrink-0">
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-base sm:text-lg text-[#1A1A1A] dark:text-[#F5F2ED] tracking-wide">My Reported Tickets</h3>
            <p className="text-xs sm:text-sm text-[#666666] dark:text-[#A0A0A0]">Track the status and progress of your requests.</p>
          </div>
        </button>
      </div>

      {/* Live Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/80 dark:bg-[#121212]/90 border border-[#E5E0D8] dark:border-[#222222] rounded-2xl p-4 flex items-center backdrop-blur-md">
          <div className="rounded-xl h-11 w-11 flex items-center justify-center bg-amber-500/15 border border-amber-500/25 text-amber-500 dark:text-amber-400 mr-3.5 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#777777] dark:text-[#737373] uppercase tracking-wider">Open</p>
            <p className="text-xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED]">{openCount}</p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-[#121212]/90 border border-[#E5E0D8] dark:border-[#222222] rounded-2xl p-4 flex items-center backdrop-blur-md">
          <div className="rounded-xl h-11 w-11 flex items-center justify-center bg-[#B87333]/15 border border-[#B87333]/25 text-[#B87333] dark:text-[#E5A96A] mr-3.5 shrink-0">
            <Loader2 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#777777] dark:text-[#737373] uppercase tracking-wider">In Progress</p>
            <p className="text-xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED]">{inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-[#121212]/90 border border-[#E5E0D8] dark:border-[#222222] rounded-2xl p-4 flex items-center backdrop-blur-md">
          <div className="rounded-xl h-11 w-11 flex items-center justify-center bg-emerald-500/15 border border-emerald-500/25 text-emerald-500 dark:text-emerald-400 mr-3.5 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#777777] dark:text-[#737373] uppercase tracking-wider">Resolved</p>
            <p className="text-xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED]">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {/* Recent Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-[#B87333]" />
              <h2 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F5F2ED] tracking-tight">Announcements</h2>
            </div>
            {announcements.length > 3 && (
              <button
                onClick={() => navigate('/resident/announcements')}
                className="text-xs font-semibold text-[#B87333] hover:text-[#C98545] transition-colors cursor-pointer"
              >
                View all ({announcements.length})
              </button>
            )}
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
          </div>
        </div>
      )}

      {/* Active Tickets List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F5F2ED] tracking-tight">Your Active Tickets</h2>
          <button
            onClick={() => navigate('/resident/my-tickets')}
            className="text-xs font-semibold text-[#B87333] hover:text-[#C98545] transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        {activeTickets.length === 0 ? (
          <div className="bg-white/60 dark:bg-[#121212]/70 rounded-2xl p-8 text-center border border-dashed border-[#E5E0D8] dark:border-[#262626]">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={28} />
            <p className="text-sm text-[#777777] dark:text-[#737373]">All caught up! No active issues reported.</p>
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
        <div className="bg-white/80 dark:bg-[#121212]/90 border border-[#E5E0D8] dark:border-[#222222] rounded-2xl p-5 sm:p-6 backdrop-blur-md">
          <h2 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F5F2ED] mb-4">Recent Activity</h2>
          <div className="space-y-5">
            {recentActivity.map((ticket) => (
              <div key={ticket._id} className="relative pl-5 border-l-2 border-[#E5E0D8] dark:border-[#262626] pb-1 last:pb-0">
                <div className={`absolute -left-[7px] top-1 h-3 w-3 rounded-full ${
                  ticket.status === 'OPEN' ? 'bg-amber-400' : 'bg-[#B87333]'
                }`} />
                <p className="text-[11px] text-[#777777] dark:text-[#737373] mb-0.5">{new Date(ticket.updatedAt).toLocaleDateString()}</p>
                <h4 className="font-medium text-xs sm:text-sm text-[#1A1A1A] dark:text-[#F5F2ED]">{ticket.title}</h4>
                <p className="text-xs text-[#666666] dark:text-[#888888] mt-0.5">
                  Status updated to <span className="text-[#B87333] font-medium">{ticket.status.replace('_', ' ')}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;
