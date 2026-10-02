import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Loader2 } from 'lucide-react';
import TicketCard from '../../components/tickets/TicketCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const api = axios.create({
  baseURL: 'https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1',
  withCredentials: true,
});

const MyTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        setLoading(true);
        const res = await api.get('/issues/my');
        setTickets(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
        setError(err.response?.data?.message || 'Failed to load your tickets.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyTickets();
    }
  }, [user]);

  const handleEdit = (ticket) => {
    navigate('/resident/new-ticket', { state: { ticketToEdit: ticket } });
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await api.delete(`/issues/${ticketId}`);
      setTickets(prev => prev.filter(t => t._id !== ticketId));
      addNotification({ title: 'Success', message: 'Ticket deleted successfully', type: 'success' });
    } catch (err) {
      console.error("Error deleting ticket:", err);
      addNotification({ 
        title: 'Error', 
        message: err.response?.data?.message || "Failed to delete the ticket.", 
        type: 'error' 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="animate-spin h-10 w-10 text-[#B87333]" />
        <p className="mt-4 text-xs text-[#777777] dark:text-[#737373]">Fetching your reported tickets...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E0D8] dark:border-[#222222] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED] font-serif tracking-tight">
            My Reported Tickets
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-[#888888] mt-1">
            Track and manage all issues submitted by your account.
          </p>
        </div>

        {/* New Ticket Button with Copper Border */}
        <button
          onClick={() => navigate('/resident/new-ticket')}
          className="flex items-center gap-2 bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/60 hover:border-[#B87333] text-[#1A1A1A] dark:text-[#F5F2ED] px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md text-xs sm:text-sm font-semibold"
        >
          <PlusCircle size={16} className="text-[#B87333] dark:text-[#E5A96A]" />
          <span>New Ticket</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 p-4 rounded-xl text-xs sm:text-sm">
          {error}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="bg-white/80 dark:bg-[#121212]/90 rounded-2xl border border-[#E5E0D8] dark:border-[#222222] p-12 text-center backdrop-blur-md">
          <div className="mx-auto w-14 h-14 bg-[#FAF7F2] dark:bg-[#1A1A1A] border border-[#E5E0D8] dark:border-[#292929] rounded-2xl flex items-center justify-center mb-4 text-[#B87333]">
            <PlusCircle size={26} />
          </div>
          <p className="text-[#666666] dark:text-[#888888] text-sm mb-4">You haven't reported any issues yet.</p>
          <button
            onClick={() => navigate('/resident/new-ticket')}
            className="text-xs font-semibold text-[#B87333] hover:underline cursor-pointer"
          >
            Create your first ticket →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map(ticket => (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
