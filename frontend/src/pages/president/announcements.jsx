import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlusCircle, Trash2, Edit2, Loader2, Bell } from 'lucide-react';
import axios from 'axios';
import AnnouncementBanner from '../../components/announcements/AnnouncementBanner';
import { useNotifications } from '../../contexts/NotificationContext';

const api = axios.create({
  baseURL: 'https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1',
  withCredentials: true,
});

const Announcements = () => {
  const { addNotification } = useNotifications();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({ title: '', body: '' });

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    pinned: false,
    expiresAt: '',
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (formData.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.length > 120) {
      errors.title = 'Title cannot exceed 120 characters';
    }
    
    if (formData.body.trim().length < 10) {
      errors.body = 'Content must be at least 10 characters long';
    } else if (formData.body.length > 5000) {
      errors.body = 'Content cannot exceed 5000 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, formData);
        addNotification({ title: 'Updated', message: 'Announcement updated successfully.' });
      } else {
        await api.post('/announcements', formData);
        addNotification({ title: 'Posted', message: 'New announcement is live.' });
      }
      setFormData({ title: '', body: '', pinned: false, expiresAt: '' });
      setFormErrors({ title: '', body: '' });
      setIsFormOpen(false);
      setEditingId(null);
      fetchAnnouncements();
    } catch (err) {
      console.error("Save error:", err);
      const errMsg = err.response?.data?.message || "";
      if (errMsg.includes("validation failed")) {
        const backendErrors = {};
        if (errMsg.toLowerCase().includes("title")) {
          backendErrors.title = "Title is invalid (min 5 characters)";
        }
        if (errMsg.toLowerCase().includes("body")) {
          backendErrors.body = "Content is invalid (min 10 characters)";
        }
        setFormErrors(backendErrors);
      } else {
        addNotification({ 
          title: 'Error', 
          message: err.response?.data?.message || "Failed to save announcement", 
          type: 'error' 
        });
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a._id !== id));
      addNotification({ title: 'Success', message: 'Announcement deleted successfully.' });
    } catch (error) {
      console.error(error);
      addNotification({ title: 'Error', message: "Delete failed", type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-[#B87333]" size={36} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E5E0D8] dark:border-[#222222] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED] font-serif tracking-tight">
            Community Announcements
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] dark:text-[#888888] mt-1">
            Broadcast important updates and circulars to all community members.
          </p>
        </div>

        {/* Action button with prominent copper border */}
        <button
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            if (isFormOpen) setEditingId(null);
          }}
          className="bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/60 hover:border-[#B87333] text-[#1A1A1A] dark:text-[#F5F2ED] px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 cursor-pointer backdrop-blur-md text-xs sm:text-sm font-semibold"
        >
          {isFormOpen ? <ArrowLeft size={16} className="text-[#B87333]" /> : <PlusCircle size={16} className="text-[#B87333] dark:text-[#E5A96A]" />}
          <span>{isFormOpen ? 'Cancel' : 'Post Announcement'}</span>
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white/95 dark:bg-[#121212]/95 p-6 sm:p-8 rounded-3xl border border-[#E5E0D8] dark:border-[#222222] backdrop-blur-xl space-y-5">
          <h2 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#F5F2ED] font-serif">
            {editingId ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>

          <div>
            <label className="block text-xs font-semibold text-[#777777] dark:text-[#A0A0A0] uppercase tracking-wider mb-2">Title</label>
            <input
              placeholder="e.g., Water Tank Maintenance on Saturday"
              className={`w-full px-4 py-3 border rounded-xl bg-[#FAF7F2] dark:bg-[#171717] text-[#1A1A1A] dark:text-[#F5F2ED] text-xs sm:text-sm focus:border-[#B87333] outline-none ${
                formErrors.title ? 'border-rose-500' : 'border-[#D5CEC2] dark:border-[#292929]'
              }`}
              value={formData.title}
              onChange={e => {
                setFormData({ ...formData, title: e.target.value });
                if (formErrors.title) setFormErrors(prev => ({ ...prev, title: '' }));
              }}
              required
            />
            {formErrors.title && <p className="text-rose-500 text-xs mt-1 font-medium">{formErrors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#777777] dark:text-[#A0A0A0] uppercase tracking-wider mb-2">Content</label>
            <textarea
              placeholder="Write the full announcement details here..."
              className={`w-full px-4 py-3 border rounded-xl bg-[#FAF7F2] dark:bg-[#171717] text-[#1A1A1A] dark:text-[#F5F2ED] text-xs sm:text-sm focus:border-[#B87333] outline-none h-32 resize-none ${
                formErrors.body ? 'border-rose-500' : 'border-[#D5CEC2] dark:border-[#292929]'
              }`}
              value={formData.body}
              onChange={e => {
                setFormData({ ...formData, body: e.target.value });
                if (formErrors.body) setFormErrors(prev => ({ ...prev, body: '' }));
              }}
              required
            />
            {formErrors.body && <p className="text-rose-500 text-xs mt-1 font-medium">{formErrors.body}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={formData.pinned}
              onChange={e => setFormData({ ...formData, pinned: e.target.checked })}
              className="accent-[#B87333] w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="pinned" className="text-xs sm:text-sm text-[#666666] dark:text-[#A0A0A0] cursor-pointer">
              Pin to Top as Important Notice
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/60 hover:border-[#B87333] text-[#1A1A1A] dark:text-[#F5F2ED] py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer backdrop-blur-md"
          >
            {editingId ? 'Update Announcement' : 'Publish Announcement'}
          </button>
        </form>
      )}

      {announcements.length === 0 ? (
        <div className="bg-white/60 dark:bg-[#121212]/70 rounded-2xl p-12 text-center border border-dashed border-[#E5E0D8] dark:border-[#262626]">
          <Bell size={28} className="mx-auto text-[#888888] dark:text-[#737373] mb-2" />
          <p className="text-xs sm:text-sm text-[#777777] dark:text-[#737373]">No announcements posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(a => (
            <div key={a._id} className="relative group">
              <AnnouncementBanner announcement={{ ...a, content: a.body, important: a.pinned }} detailed />
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingId(a._id);
                    setFormData({ title: a.title, body: a.body, pinned: a.pinned });
                    setIsFormOpen(true);
                  }}
                  className="p-1.5 bg-white/90 dark:bg-[#1E1E1E]/90 hover:bg-[#F0EBE4] dark:hover:bg-[#2A2A2A] border border-[#B87333]/50 hover:border-[#B87333] rounded-lg text-[#555555] dark:text-[#A0A0A0] hover:text-[#B87333] transition-colors cursor-pointer backdrop-blur-md"
                  title="Edit Notice"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="p-1.5 bg-white/90 dark:bg-[#1E1E1E]/90 hover:bg-rose-50 dark:hover:bg-rose-500/20 border border-rose-300 dark:border-[#333333] hover:border-rose-500 rounded-lg text-[#666666] dark:text-[#A0A0A0] hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer backdrop-blur-md"
                  title="Delete Notice"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
