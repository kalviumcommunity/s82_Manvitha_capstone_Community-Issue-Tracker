import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnalyticsChart from '../../components/analytics/AnalyticsChart';
import { mockAnalytics } from '../../data/mockData';

const Analytics = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('month');
  
  // Mock transformations - in a real app, these would be API calls with date range params
  const categoryData = Object.entries(mockAnalytics.ticketsByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: name === 'maintenance' ? '#0088FE' :
           name === 'security' ? '#FF8042' :
           name === 'noise' ? '#FFBB28' :
           name === 'cleanliness' ? '#00C49F' :
           name === 'amenities' ? '#8884d8' :
           name === 'payments' ? '#82ca9d' : '#ffc658'
  }));
  
  const statusData = Object.entries(mockAnalytics.ticketsByStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' '),
    value,
    color: name === 'open' ? '#FFBB28' :
           name === 'in-progress' ? '#0088FE' :
           name === 'resolved' ? '#00C49F' : '#82ca9d'
  }));
  
  const priorityData = Object.entries(mockAnalytics.ticketsByPriority).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: name === 'urgent' ? '#FF0000' :
           name === 'high' ? '#FF8042' :
           name === 'medium' ? '#FFBB28' : '#00C49F'
  }));
  
  const trendData = mockAnalytics.ticketsTrend.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: item.count,
    color: '#0088FE'
  }));

  // Stats cards
  const stats = [
    { title: 'Total Tickets', value: Object.values(mockAnalytics.ticketsByStatus).reduce((a, b) => a + b, 0) },
    { title: 'Open Tickets', value: mockAnalytics.ticketsByStatus.open },
    { title: 'Avg. Resolution Time', value: `${mockAnalytics.averageResolutionTime} hrs` },
    { title: 'Urgent Tickets', value: mockAnalytics.ticketsByPriority.urgent },
  ];
  
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/president')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Dashboard</span>
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
          Analytics Dashboard
        </h1>
        
        <div className="flex">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>
      
      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AnalyticsChart
          data={categoryData}
          title="Tickets by Category"
          type="pie"
        />
        <AnalyticsChart
          data={statusData}
          title="Tickets by Status"
          type="pie"
        />
      </div>
      
      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          data={priorityData}
          title="Tickets by Priority"
          type="bar"
        />
        <AnalyticsChart
          data={trendData}
          title="Ticket Trends"
          type="bar"
        />
      </div>
    </div>
  );
};

export default Analytics;
