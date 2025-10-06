import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, MessageSquare, Clock, Bell, CheckCircle2 } from 'lucide-react';
import { mockTickets, mockAnnouncements } from '../../data/mockData';
import TicketCard from '../../components/tickets/TicketCard';
import AnnouncementBanner from '../../components/announcements/AnnouncementBanner';
import { useAuth } from '../../contexts/AuthContext';

const ResidentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userTickets = user 
    ? mockTickets.filter(ticket => ticket.createdBy === user.id)
    : [];

  const activeTickets = userTickets.filter(
    ticket => ticket.status === 'open' || ticket.status === 'in-progress'
  );

  const recentTickets = [...userTickets]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const importantAnnouncements = mockAnnouncements
    .filter(announcement => announcement.important)
    .slice(0, 2);

  if (!user) return null;

  const openCount = userTickets.filter(t => t.status === 'open').length;
  const inProgressCount = userTickets.filter(t => t.status === 'in-progress').length;
  const resolvedCount = userTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        User Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => navigate('/resident/new-ticket')}
          className="bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-6 flex items-center">
            <div className="rounded-full bg-white/20 p-3 mr-4">
              <PlusCircle size={24} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg">Submit a New Ticket</h3>
              <p className="text-blue-100">Report an issue or request assistance</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/resident/my-tickets')}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-colors text-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-6 flex items-center">
            <div className="rounded-full bg-white/20 p-3 mr-4">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-lg">View My Tickets</h3>
              <p className="text-indigo-100">Track the status of your requests</p>
            </div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400 mr-4">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{openCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 mr-4">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{inProgressCount}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 mr-4">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{resolvedCount}</p>
          </div>
        </div>
      </div>

      {importantAnnouncements.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Bell size={20} className="text-red-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Important Announcements
            </h2>
          </div>
          <div className="space-y-4">
            {importantAnnouncements.map(announcement => (
              <AnnouncementBanner key={announcement.id} announcement={announcement} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Active Tickets
          </h2>
          <button 
            onClick={() => navigate('/resident/my-tickets')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
          >
            View All
          </button>
        </div>

        {activeTickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-400 mb-4">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              You don't have any active tickets.
            </p>
            <button
              onClick={() => navigate('/resident/new-ticket')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle size={16} className="mr-2" />
              Submit a ticket
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTickets.slice(0, 4).map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      {recentTickets.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Ticket Activity
            </h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="relative pl-8 pb-0">
              {recentTickets.map((ticket, index) => (
                <div key={ticket.id} className="mb-6 relative">
                  {index < recentTickets.length - 1 && (
                    <div className="absolute left-0 top-2 -ml-3.5 h-full w-px bg-gray-300 dark:bg-gray-600"></div>
                  )}

                  <div className={`absolute left-0 top-2 -ml-4 h-4 w-4 rounded-full ${
                    ticket.status === 'open' ? 'bg-yellow-500' :
                    ticket.status === 'in-progress' ? 'bg-blue-500' :
                    ticket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>

                  <div className="flex flex-col sm:flex-row sm:items-start">
                    <div className="sm:w-36 flex-shrink-0 mb-2 sm:mb-0">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {ticket.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Status: <span className="capitalize">{ticket.status.replace('-', ' ')}</span>
                      </p>
                      <button
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentDashboard;
