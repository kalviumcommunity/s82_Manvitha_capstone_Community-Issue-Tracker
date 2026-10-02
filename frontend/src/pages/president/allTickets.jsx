import React, { useState, useEffect } from "react";
import api from "../../api/api";
import TicketCard from "../../components/tickets/TicketCard";
import { Search, Filter, Loader2 } from "lucide-react";

const AllTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await api.get("/issues");
        setTickets(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load tickets. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      filterStatus === "all" || ticket.status?.toLowerCase() === filterStatus.toLowerCase();

    const matchesSearch =
      ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.unit?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-[#B87333]" size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-10 bg-[#121212] border border-[#262626] rounded-2xl">
        <p className="text-rose-400 text-sm mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2 text-xs font-semibold bg-[#B87333]/20 hover:bg-[#B87333]/30 border border-[#B87333]/45 text-[#F5F2ED] rounded-xl transition-all cursor-pointer backdrop-blur-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F2ED] font-serif tracking-tight">
            All Community Tickets
          </h1>
          <p className="text-xs sm:text-sm text-[#888888] mt-1">
            Monitor and update all issues reported across the community.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#737373]" size={16} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[#262626] rounded-xl bg-[#141414] text-xs sm:text-sm text-[#F5F2ED] focus:border-[#B87333]/60 outline-none"
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 text-[#737373]" size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2 border border-[#262626] rounded-xl bg-[#141414] text-xs sm:text-sm text-[#F5F2ED] focus:border-[#B87333]/60 outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#141414]">All Status</option>
              <option value="open" className="bg-[#141414]">Open</option>
              <option value="in_progress" className="bg-[#141414]">In Progress</option>
              <option value="resolved" className="bg-[#141414]">Resolved</option>
              <option value="closed" className="bg-[#141414]">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className="bg-[#121212]/70 rounded-2xl p-12 text-center border border-dashed border-[#262626]">
          <p className="text-xs sm:text-sm text-[#737373]">No tickets found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AllTickets;
