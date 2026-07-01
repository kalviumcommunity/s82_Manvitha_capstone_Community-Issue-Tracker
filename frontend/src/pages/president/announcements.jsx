import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Unused
import { ArrowLeft, Send, Calendar, PlusCircle, Trash, Edit, Loader2 } from 'lucide-react';
import axios from 'axios';
import AnnouncementBanner from '../../components/announcements/AnnouncementBanner';
// import { useAuth } from '../../contexts/AuthContext'; // Unused
import { useNotifications } from '../../contexts/NotificationContext';

const api = axios.create({
  baseURL: 'http://localhost:3551/api/v1',
  withCredentials: true,
});

const Announcements = () => {
  // const navigate = useNavigate(); // Unused
  // const { user } = useAuth(); // Unused
  const { addNotification } = useNotifications();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({ title: '', body: '' });

  const [formData, setFormData] = useState({
    title: '',
    body: '', // Matches backend Schema field 'body'
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
    
    // Front-end validation
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
    } catch (error) { // Renamed or just ignore
      console.error(error);
      addNotification({ title: 'Error', message: "Delete failed", type: 'error' });
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Announcements</h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          {isFormOpen ? <ArrowLeft size={18} /> : <PlusCircle size={18} />}
          {isFormOpen ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8 space-y-4 border dark:border-gray-700">
          <div>
            <input
              placeholder="Title"
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white ${
                formErrors.title ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'dark:border-gray-600 focus:ring-blue-500'
              }`}
              value={formData.title}
              onChange={e => {
                setFormData({ ...formData, title: e.target.value });
                if (formErrors.title) setFormErrors(prev => ({ ...prev, title: '' }));
              }}
              required
            />
            {formErrors.title && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.title}</p>}
          </div>

          <div>
            <textarea
              placeholder="Announcement content..."
              className={`w-full p-2 border rounded dark:bg-gray-700 dark:text-white h-32 ${
                formErrors.body ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'dark:border-gray-600 focus:ring-blue-500'
              }`}
              value={formData.body}
              onChange={e => {
                setFormData({ ...formData, body: e.target.value });
                if (formErrors.body) setFormErrors(prev => ({ ...prev, body: '' }));
              }}
              required
            />
            {formErrors.body && <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.body}</p>}
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.pinned}
                onChange={e => setFormData({ ...formData, pinned: e.target.checked })}
              />
              Pin to Top (Important)
            </label>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold">
            {editingId ? 'Update Announcement' : 'Publish Now'}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {announcements.map(a => (
          <div key={a._id} className="relative group">
            {/* Map 'body' to 'content' for the Banner component prop expectation */}
            <AnnouncementBanner announcement={{ ...a, content: a.body, important: a.pinned }} detailed />
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => {
                setEditingId(a._id);
                setFormData({ title: a.title, body: a.body, pinned: a.pinned });
                setIsFormOpen(true);
              }} className="p-2 bg-white shadow rounded-full text-blue-600"><Edit size={14} /></button>
              <button onClick={() => handleDelete(a._id)} className="p-2 bg-white shadow rounded-full text-red-600"><Trash size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;