import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Search, Filter } from 'lucide-react';

const TicketFilter = ({ onFilter }) => {
  // Load filters from cookies or use defaults
  const [filters, setFilters] = useState(() => {
    const savedFilters = Cookies.get('ticketFilters');
    return savedFilters
      ? JSON.parse(savedFilters)
      : { search: '', categories: [], priorities: [], statuses: [] };
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update cookies whenever filters change
  useEffect(() => {
    Cookies.set('ticketFilters', JSON.stringify(filters), { expires: 7 }); // lasts 7 days
  }, [filters]);

  // Trigger parent update on mount
  useEffect(() => {
    onFilter(filters);
  }, []); // run once on load

  const handleSearchChange = (e) => {
    const newFilters = { ...filters, search: e.target.value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleCheckboxChange = (e, type, value) => {
    const newFilters = { ...filters };
    if (e.target.checked) {
      newFilters[type] = [...newFilters[type], value];
    } else {
      newFilters[type] = newFilters[type].filter(item => item !== value);
    }
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const resetFilters = () => {
    const reset = { search: '', categories: [], priorities: [], statuses: [] };
    setFilters(reset);
    Cookies.remove('ticketFilters'); // remove saved filters
    onFilter(reset);
  };

  const categories = ['maintenance', 'security', 'noise', 'cleanliness', 'amenities', 'payments', 'other'];
  const priorities = ['urgent', 'high', 'medium', 'low'];
  const statuses = ['open', 'in-progress', 'resolved', 'closed'];

  return (
    <div className="w-full bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search tickets..."
          value={filters.search}
          onChange={handleSearchChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap items-center mt-3 gap-2">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
        >
          <Filter size={16} className="mr-1" />
          Filters {(filters.categories.length > 0 || filters.priorities.length > 0 || filters.statuses.length > 0) && '(Active)'}
        </button>

        {(filters.categories.length > 0 || filters.priorities.length > 0 || filters.statuses.length > 0) && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Dropdown Filter Panel */}
      {isFilterOpen && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</h4>
            <div className="space-y-2">
              {categories.map(category => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={e => handleCheckboxChange(e, 'categories', category)}
                    className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priorities */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priorities</h4>
            <div className="space-y-2">
              {priorities.map(priority => (
                <label key={priority} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.priorities.includes(priority)}
                    onChange={e => handleCheckboxChange(e, 'priorities', priority)}
                    className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{priority}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h4>
            <div className="space-y-2">
              {statuses.map(status => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(status)}
                    onChange={e => handleCheckboxChange(e, 'statuses', status)}
                    className="rounded text-blue-500 focus:ring-blue-500 h-4 w-4 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">{status.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketFilter;
