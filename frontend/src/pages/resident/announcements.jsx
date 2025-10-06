import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Calendar, PlusCircle, Trash, Edit, Eye } from 'lucide-react';
import { mockAnnouncements } from '../../data/mockData';
import AnnouncementBanner from '../../components/announcements/AnnouncementBanner';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const ViewAnnouncements = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    important: false,
    scheduledFor: '',
  });
  
  const filteredAnnouncements = announcements.filter(announcement => {
    if (viewMode === 'all') return true;
    
    const hasScheduledDate = !!announcement.scheduledFor;
    const scheduledDate = hasScheduledDate ? new Date(announcement.scheduledFor) : null;
    const now = new Date();
    
    if (viewMode === 'scheduled') {
      return hasScheduledDate && scheduledDate && scheduledDate > now;
    }
    
    if (viewMode === 'past') {
      return !hasScheduledDate || (scheduledDate && scheduledDate <= now);
    }
    
    return true;
  });
  
  const handleChange = (
    e
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newAnnouncement = {
      id: `a${announcements.length + 1}`,
      title: formData.title,
      content: formData.content,
      important: formData.important,
      createdBy: user?.id || '',
      createdAt: new Date().toISOString(),
      scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : undefined,
    };
    
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    
    // Reset form
    setFormData({
      title: '',
      content: '',
      important: false,
      scheduledFor: '',
    });
    
    setIsFormOpen(false);
    
    // Add notification (in a real app, we'd notify all residents)
    addNotification({
      userId: user?.id || '',
      title: 'Announcement Created',
      message: `Announcement "${formData.title}" has been created successfully.`,
      read: false,
      type: 'announcement',
    });
  };
  
  const deleteAnnouncement = (id) => {
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== id));
  };
  
  if (!user) return null;
  
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
          Manage Announcements
        </h1>
        
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isFormOpen ? (
            <>
              <ArrowLeft size={16} className="mr-2" />
              Cancel
            </>
          ) : (
            <>
              <PlusCircle size={16} className="mr-2" />
              New Announcement
            </>
          )}
        </button>
      </div>
      
      {isFormOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Create New Announcement
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label 
                  htmlFor="title" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter announcement title"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              {/* Content */}
              <div>
                <label 
                  htmlFor="content" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Enter announcement content"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              {/* Important checkbox & Schedule date */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="sm:w-1/2">
                  <label 
                    htmlFor="scheduledFor" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Schedule for (optional)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      id="scheduledFor"
                      name="scheduledFor"
                      value={formData.scheduledFor}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="sm:w-1/2 flex items-center">
                  <input
                    type="checkbox"
                    id="important"
                    name="important"
                    checked={formData.important}
                    onChange={e => setFormData(prev => ({ ...prev, important: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label 
                    htmlFor="important" 
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Mark as important
                  </label>
                </div>
              </div>
              
              {/* Submit button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Send size={16} className="mr-2" />
                  {formData.scheduledFor ? 'Schedule Announcement' : 'Post Announcement'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* Filter tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            viewMode === 'all'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          All Announcements
        </button>
        <button
          onClick={() => setViewMode('scheduled')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            viewMode === 'scheduled'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setViewMode('past')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            viewMode === 'past'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Past Announcements
        </button>
      </div>
      
      {/* Announcements list */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No announcements found for the selected filter.
            </p>
          </div>
        ) : (
          filteredAnnouncements.map(announcement => (
            <div 
              key={announcement.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <AnnouncementBanner announcement={announcement} detailed />
              
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-750 flex justify-end space-x-2">
                <button 
                  onClick={() => deleteAnnouncement(announcement.id)}
                  className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash size={16} />
                </button>
                <button className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  <Edit size={16} />
                </button>
                <button className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewAnnouncements;
