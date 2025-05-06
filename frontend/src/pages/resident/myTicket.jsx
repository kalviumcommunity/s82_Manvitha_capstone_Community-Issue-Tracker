import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import TicketCard from '../../components/tickets/TicketCard';
import TicketFilter from '../../components/tickets/TicketFilter';

import { mockTickets } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

const MyTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  
  useEffect(() => {
    if (user) {
      // Get tickets created by the current user
      const userTickets = mockTickets.filter(ticket => ticket.createdBy === user.id);
      setTickets(userTickets);
      setFilteredTickets(userTickets);
    }
  }, [user]);
  
  const handleFilter = (filters) => {
    let result = [...tickets];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        ticket => 
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter(ticket => filters.categories.includes(ticket.category));
    }
    
    // Apply priority filter
    if (filters.priorities.length > 0) {
      result = result.filter(ticket => filters.priorities.includes(ticket.priority));
    }
    
    // Apply status filter
    if (filters.statuses.length > 0) {
      result = result.filter(ticket => filters.statuses.includes(ticket.status));
    }
    
    setFilteredTickets(result);
  };
  
  if (!user) return null;
  
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/resident')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Dashboard</span>
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          My Tickets
        </h1>
        
        <button
          onClick={() => navigate('/resident/new-ticket')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle size={16} className="mr-2" />
          New Ticket
        </button>
      </div>
      
      <TicketFilter onFilter={handleFilter} />
      
      {filteredTickets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have any tickets yet.</p>
          <button
            onClick={() => navigate('/resident/new-ticket')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle size={16} className="mr-2" />
            Create your first ticket
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
