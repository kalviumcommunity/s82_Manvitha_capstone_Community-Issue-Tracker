import React from 'react';
import { Bell, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const AnnouncementBanner = ({ announcement, detailed = false }) => {
  const formattedDate = announcement.scheduledFor
    ? format(new Date(announcement.scheduledFor), 'MMM d, yyyy h:mm a')
    : announcement.createdAt
    ? format(new Date(announcement.createdAt), 'MMM d, yyyy')
    : '';

  const isImportant = announcement.important || announcement.pinned;

  return (
    <div
      className={`
        rounded-2xl overflow-hidden transition-all duration-200 backdrop-blur-md
        ${isImportant
          ? 'border border-[#B87333]/50 bg-gradient-to-br from-[#B87333]/15 via-[#171717]/90 to-[#121212]/90'
          : 'border border-[#222222] bg-[#121212]/90 hover:border-[#2E2E2E]'}
      `}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className={`
            shrink-0 rounded-xl p-2.5
            ${isImportant
              ? 'bg-[#B87333]/20 border border-[#B87333]/40 text-[#E5A96A]'
              : 'bg-[#1E1E1E] border border-[#2E2E2E] text-[#B87333]'}
          `}>
            {isImportant ? <AlertCircle size={18} /> : <Bell size={18} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <h3 className="font-semibold text-sm sm:text-base text-[#F5F2ED] tracking-tight">
                {announcement.title}
              </h3>

              {isImportant && (
                <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-[#B87333]/20 text-[#E5A96A] border border-[#B87333]/40 rounded-full uppercase tracking-wider">
                  Important
                </span>
              )}
            </div>

            <div className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed mb-2 whitespace-pre-wrap">
              {detailed ? (announcement.content || '') : (announcement.content || '').length > 140
                ? (announcement.content || '').substring(0, 140) + '...'
                : (announcement.content || '')}
            </div>

            {formattedDate && (
              <div className="text-[11px] text-[#737373]">
                Posted: {formattedDate}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
