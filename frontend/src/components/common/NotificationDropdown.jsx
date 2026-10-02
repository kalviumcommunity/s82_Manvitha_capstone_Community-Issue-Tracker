import React from 'react';
import { Check, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    onClose();
    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl rounded-2xl border border-[#E5E0D8] dark:border-[#262626] shadow-lg z-50 overflow-hidden">
        <div className="p-6 text-center text-[#777777] dark:text-[#737373]">
          <Bell size={24} className="mx-auto mb-2 opacity-40 text-[#B87333]" />
          <p className="text-sm font-medium">No notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl rounded-2xl border border-[#E5E0D8] dark:border-[#262626] shadow-lg z-50 overflow-hidden">
      <div className="p-3.5 border-b border-[#EAE5DD] dark:border-[#262626] flex justify-between items-center bg-[#F8F6F2] dark:bg-[#171717]/60">
        <h3 className="font-semibold text-sm text-[#1A1A1A] dark:text-[#F5F2ED]">Notifications</h3>
        <button
          onClick={() => {
            markAllAsRead();
            onClose();
          }}
          className="text-xs font-medium text-[#B87333] hover:text-[#C98545] transition-colors cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-[#EAE5DD] dark:divide-[#1F1F1F]">
        {notifications.map(notification => (
          <div
            key={notification._id}
            onClick={() => handleNotificationClick(notification)}
            className={`p-3.5 cursor-pointer transition-colors ${
              notification.read
                ? 'bg-transparent text-[#666666] dark:text-[#A0A0A0]'
                : 'bg-[#B87333]/10 text-[#1A1A1A] dark:text-[#F5F2ED]'
            } hover:bg-[#F3EFE8] dark:hover:bg-[#1A1A1A]`}
          >
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 mt-1">
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-[#B87333]" />
                )}
              </div>

              <div className="flex-grow min-w-0">
                <p className={`text-xs ${notification.read ? 'text-[#555555] dark:text-[#D4D4D4]' : 'font-semibold text-[#1A1A1A] dark:text-[#F5F2ED]'}`}>
                  {notification.title}
                </p>
                <p className="text-xs text-[#777777] dark:text-[#808080] mt-0.5 line-clamp-2">
                  {notification.body}
                </p>
                <p className="text-[10px] text-[#999999] dark:text-[#555555] mt-1">
                  {notification.createdAt 
                    ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                    : 'Just now'}
                </p>
              </div>

              {!notification.read && (
                <button
                  className="flex-shrink-0 text-[#888888] hover:text-[#B87333] transition-colors p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification._id);
                  }}
                  title="Mark as read"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDropdown;
