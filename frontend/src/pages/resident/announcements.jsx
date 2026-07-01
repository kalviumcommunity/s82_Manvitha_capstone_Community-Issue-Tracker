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

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Bell className="text-blue-500" />
        <h1 className="text-2xl font-bold dark:text-white">Community Notice Board</h1>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-500">No announcements at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map(a => (
            <AnnouncementBanner 
              key={a._id} 
              announcement={{...a, content: a.body, important: a.pinned}} 
              detailed 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResidentAnnouncements;
