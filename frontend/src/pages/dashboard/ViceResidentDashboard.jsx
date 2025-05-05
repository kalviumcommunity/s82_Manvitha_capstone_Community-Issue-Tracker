import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Clock, Search } from 'lucide-react';
import { mockTickets } from '../../data/mockData';
import TicketCard from '../../components/tickets/TicketCard';
import { useAuth } from '../../contexts/AuthContext';

const VicePresidentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get relevant ticket counts
  const urgentTickets = mockTickets.filter(t => t.priority === 'urgent');
  const assignedTickets = mockTickets.filter(t => t.assignedTo === user?.id);
  const inProgressTickets = mockTickets.filter(t => t.status === 'in-progress');
  const recentlyResolvedTickets = mockTickets
    .filter(t => t.status === 'resolved')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Vice President Dashboard
      </h1>
      
      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400 mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Urgent Tickets</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{urgentTickets.length}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 mr-4">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned to Me</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{assignedTickets.length}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
          <div className="rounded-full h-12 w-12 flex items-center justify-center bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400 mr-4">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{inProgressTickets.length}</p>
          </div>
        </div>
      </div>
      
      {/* Urgent Tickets */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Urgent Tickets</h2>
          <button 
            onClick={() => navigate('/vice-president/urgent')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
          >
            View All
          </button>
        </div>
        
        {urgentTickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-400 mb-4">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              No urgent tickets at the moment!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentTickets.slice(0, 4).map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
      
      {/* Tickets Assigned to Me */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Assigned to Me</h2>
          <button 
            onClick={() => navigate('/vice-president/assigned')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
          >
            View All
          </button>
        </div>
        
        {assignedTickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-400 mb-4">
              <Search size={24} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              You don't have any tickets assigned to you yet.
            </p>
            <button
              onClick={() => navigate('/vice-president/urgent')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Find tickets to work on
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedTickets.slice(0, 4).map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
      
      {/* Recently Resolved */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recently Resolved</h2>
          <button 
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
          >
            View All
          </button>
        </div>
        
        {recentlyResolvedTickets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No tickets have been resolved recently.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentlyResolvedTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VicePresidentDashboard;
