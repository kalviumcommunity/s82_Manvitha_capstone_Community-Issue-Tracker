import React, { useState } from "react";
import { mockTickets } from "../../data/mockData";
import TicketCard from "../../components/tickets/TicketCard";
import { Search, Filter } from "lucide-react";

const AllTickets = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Filter + Search logic
  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.apartment.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          All Tickets
        </h1>
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by title or apartment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-700 
                         rounded-lg bg-white dark:bg-gray-800 text-gray-900 
                         dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-700 
                         rounded-lg bg-white dark:bg-gray-800 text-gray-900 
                         dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Grid/List */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
          No tickets found.
        </div>
      )}
    </div>
  );
};

export default AllTickets;
