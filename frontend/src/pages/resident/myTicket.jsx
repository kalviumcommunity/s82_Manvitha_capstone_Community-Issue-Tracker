import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Loader2 } from 'lucide-react';
import TicketCard from '../../components/tickets/TicketCard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

// Configure instance for this file (or use your central api.js)
const api = axios.create({
  baseURL: 'https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1',
  withCredentials: true,
});

const MyTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Use the authenticated user from Context
  const { addNotification } = useNotifications();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        setLoading(true);
        // Your backend has: exports.my = asyncHandler(async (req, res) => ...
        // and route: router.get('/my', c.my);
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
    // Navigates to NewTicket and passes the ticket object to fill the form
    navigate('/resident/new-ticket', { state: { ticketToEdit: ticket } });
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      // Backend route: router.delete('/:id', rbac('PRESIDENT','SECRETARY'), c.remove);
      // Note: Check your backend RBAC, if Resident can't delete, this will 403.
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
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
        <p className="mt-4 text-gray-500">Fetching your issues...</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reported Issues</h1>
        <button
          onClick={() => navigate('/resident/new-ticket')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={18} />
          <span>New Ticket</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <PlusCircle size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't reported any issues yet.</p>
          <button
            onClick={() => navigate('/resident/new-ticket')}
            className="text-blue-600 font-medium hover:underline"
          >
            Create your first ticket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
