import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, Loader2 } from 'lucide-react';
import AnnouncementBanner from '../../components/announcements/AnnouncementBanner';

const api = axios.create({
  baseURL: 'https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1',
  withCredentials: true,
});

const ResidentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/announcements')
      .then(res => setAnnouncements(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-[#B87333]" size={36} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-[#222222] pb-5">
        <div className="flex items-center gap-2.5">
          <Bell size={24} className="text-[#B87333]" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F2ED] font-serif tracking-tight">
            Community Notice Board
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#888888] mt-1">
          Stay up to date with the latest community broadcasts, events, and maintenance alerts.
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-16 bg-[#121212]/70 rounded-2xl border border-dashed border-[#262626]">
          <Bell size={28} className="mx-auto text-[#737373] mb-2" />
          <p className="text-xs sm:text-sm text-[#737373]">No announcements at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <AnnouncementBanner 
              key={a._id} 
              announcement={{ ...a, content: a.body, important: a.pinned }} 
              detailed 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResidentAnnouncements;
