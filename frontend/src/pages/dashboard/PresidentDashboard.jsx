import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Users, AlertTriangle, CheckCircle2, Bell, PlusCircle } from 'lucide-react';
import { mockTickets, mockAnnouncements,} from '../../data/mockData';
import TicketCard from '../../components/tickets/TicketCard';
import AnnouncementBanner from '../../components/announcements/AnnouncementBanner';

const PresidentDashboard = () => {
  const navigate = useNavigate();

  const totalTickets = mockTickets.length;
  const openTickets = mockTickets.filter(t => t.status === 'open').length;
  const urgentTickets = mockTickets.filter(t => t.priority === 'urgent').length;
  const resolvedTickets = mockTickets.filter(t => t.status === 'resolved').length;

  
  
  const recentTickets = [...mockTickets].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);

  const recentAnnouncements = [...mockAnnouncements].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 2);

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Admin Dashboard
      </h1>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tickets</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalTickets}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400 mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Tickets</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{openTickets}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgent Tickets</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{urgentTickets}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400 mr-4">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{resolvedTickets}</p>
          </div>
        </div>
      </div>

      

      {/* Recent Tickets */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Tickets</h2>
          <button
            onClick={() => navigate('/president/all-Tickets')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentTickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} compact />
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Announcements</h2>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/president/announcements')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
            >
              View All
            </button>
            <button
              onClick={() => navigate('/president/announcements')}
              className="flex items-center text-sm text-green-600 dark:text-green-400 hover:underline focus:outline-none"
            >
              <PlusCircle size={14} className="mr-1" />
              New
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {recentAnnouncements.map(announcement => (
            <AnnouncementBanner key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresidentDashboard;
