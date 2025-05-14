import React from 'react';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';

const AnnouncementBanner = ({ announcement, detailed = false }) => {
  // Format date
  const formattedDate = announcement.scheduledFor 
    ? format(new Date(announcement.scheduledFor), 'MMM d, yyyy h:mm a') 
    : '';

  return (
    <div 
      className={`
        border rounded-lg overflow-hidden transition-all duration-200
        ${announcement.important 
          ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20' 
          : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={`
            flex-shrink-0 rounded-full p-2 mr-3
            ${announcement.important 
              ? 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400' 
              : 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400'}
          `}>
            <Bell size={16} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`font-semibold 
                ${announcement.important 
                  ? 'text-red-700 dark:text-red-400' 
                  : 'text-blue-700 dark:text-blue-400'}
              `}>
                {announcement.title}
              </h3>
              
              {announcement.important && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 rounded-full">
                  Important
                </span>
              )}
            </div>
            
            <div className={`
              text-sm mb-2 
              ${announcement.important 
                ? 'text-red-700 dark:text-red-300' 
                : 'text-blue-700 dark:text-blue-300'}
            `}>
              {detailed ? announcement.content : announcement.content.length > 120 
                ? announcement.content.substring(0, 120) + '...' 
                : announcement.content}
            </div>
            
            {formattedDate && (
              <div className={`
                text-xs font-medium
                ${announcement.important 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-blue-600 dark:text-blue-400'}
              `}>
                Scheduled for: {formattedDate}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
