import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext'; // Unused
import { useNotifications } from '../../contexts/NotificationContext';
import axios from 'axios';

// API Instance aligned with your backend
const api = axios.create({
  baseURL: 'https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1',
  withCredentials: true,
});

const NewTicket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketToEdit = location.state?.ticketToEdit;
  // const { user } = useAuth(); // Unused
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other', // default category
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  useEffect(() => {
    if (ticketToEdit) {
      setFormData({
        title: ticketToEdit.title || '',
        description: ticketToEdit.description || '',
        category: ticketToEdit.category || 'other',
      });
    }
  }, [ticketToEdit]);

  const categories = [
    'maintenance',
    'security',
    'noise',
    'cleanliness',
    'amenities',
    'payments',
    'other',
  ];

  const validate = () => {
    const errors = {};
    const titleVal = formData.title.trim();
    const descVal = formData.description.trim();

    if (!titleVal) {
      errors.title = 'Title is required';
    } else if (titleVal.length < 5) {
      errors.title = 'Title must be at least 5 characters long';
    }

    if (!descVal) {
      errors.description = 'Description is required';
    } else if (descVal.length < 10) {
      errors.description = 'Description must be at least 10 characters long';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleAutoFill = async () => {
    if (!formData.title.trim()) {
      setFormErrors((prev) => ({ ...prev, title: 'Enter a title first for AI help' }));
      return;
    }

    try {
      setLoadingSuggestion(true);
      setAiSuggestions([]); // Clear previous
      const res = await api.post('/autocomplete', {
        title: formData.title,
        description: formData.description,
      });

      if (res.data?.suggestions && res.data.suggestions.length > 0) {
        setAiSuggestions(res.data.suggestions);
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
      const errorMsg = err.response?.data?.message || 'AI service temporarily busy. Please try again later.';
      addNotification({ title: 'AI Suggestion Error', message: errorMsg, type: 'error' });
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setFormData((prev) => ({ ...prev, description: suggestion }));
    setAiSuggestions([]); // Close suggestion list
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      if (ticketToEdit?._id) {
        // Update
        await api.put(`/issues/${ticketToEdit._id}`, formData);
        addNotification({
          title: 'Ticket Updated',
          message: `Your ticket "${formData.title}" has been updated.`,
          type: 'ticket',
        });
      } else {
        // Create
        await api.post('/issues', formData);
        addNotification({
          title: 'Ticket Created',
          message: `Your ticket "${formData.title}" is now open.`,
          type: 'ticket',
          linkTo: `/resident/my-tickets`,
        });
      }
      navigate('/resident/my-tickets');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit ticket';
      
      // Parse Mongoose / Backend validation errors if present
      if (msg.includes('validation failed') || msg.includes('Validation failed')) {
        const backendErrors = {};
        
        const titleMatch = msg.match(/title:\s*([^,.]+)/i);
        if (titleMatch) {
          backendErrors.title = titleMatch[1]
            .replace(/Path `title`|Path 'title'/g, 'Title')
            .replace(/\(\s*[`'].*?[`']\s*,\s*length\s+\d+\s*\)/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }
        
        const descMatch = msg.match(/description:\s*([^,.]+)/i);
        if (descMatch) {
          backendErrors.description = descMatch[1]
            .replace(/Path `description`|Path 'description'/g, 'Description')
            .replace(/\(\s*[`'].*?[`']\s*,\s*length\s+\d+\s*\)/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }
        
        const categoryMatch = msg.match(/category:\s*([^,.]+)/i);
        if (categoryMatch) {
          backendErrors.category = categoryMatch[1]
            .replace(/Path `category`|Path 'category'/g, 'Category')
            .replace(/\(\s*[`'].*?[`']\s*,\s*length\s+\d+\s*\)/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }

        if (Object.keys(backendErrors).length > 0) {
          setFormErrors(backendErrors);
          return;
        }
      }
      
      addNotification({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {ticketToEdit ? 'Edit Issue Report' : 'Report a New Community Issue'}
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Short Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Street light broken in Block C"
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 outline-none transition-all ${formErrors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-100'
                  }`}
              />
              {formErrors.title && <p className="mt-1 text-xs text-red-500">{formErrors.title}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-100 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Full Details
                </label>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={loadingSuggestion}
                  className="flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-opacity disabled:opacity-50"
                >
                  <Sparkles size={14} className="mr-1" />
                  {loadingSuggestion ? 'Refining...' : 'AI Rephrase'}
                </button>
              </div>

              {/* AI Suggestions List */}
              {aiSuggestions.length > 0 && (
                <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-500 dark:text-blue-400 mb-2">
                    Pick a version to use:
                  </p>
                  <div className="grid gap-2">
                    {aiSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectSuggestion(s)}
                        className="text-left p-3 text-sm rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-300 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Send size={12} className="text-blue-500" />
                        </div>
                        <span className="text-gray-800 dark:text-gray-200 line-clamp-3 italic">
                          "{s}"
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAiSuggestions([])}
                      className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-center w-full mt-1"
                    >
                      Cancel suggestions
                    </button>
                  </div>
                </div>
              )}

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the issue in detail or type a rough draft to rephrase with AI..."
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 outline-none transition-all ${formErrors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-100'
                  }`}
              />
              {formErrors.description && <p className="mt-1 text-xs text-red-500">{formErrors.description}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <Send size={20} className="mr-2" />
              )}
              {ticketToEdit ? 'Update Report' : 'Submit Issue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTicket;
