import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1',
  withCredentials: true,
});

const NewTicket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketToEdit = location.state?.ticketToEdit;
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
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
      setAiSuggestions([]);
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
    setAiSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      if (ticketToEdit?._id) {
        await api.put(`/issues/${ticketToEdit._id}`, formData);
        addNotification({
          title: 'Ticket Updated',
          message: `Your ticket "${formData.title}" has been updated.`,
          type: 'ticket',
        });
      } else {
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        {/* Back Button with prominent glassy copper border */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-[#141414]/80 hover:bg-[#F2EDE3] dark:hover:bg-[#1A1A1A] border border-[#B87333]/60 hover:border-[#B87333] text-xs font-semibold text-[#1A1A1A] dark:text-[#F5F2ED] transition-all cursor-pointer backdrop-blur-md mb-4"
        >
          <ArrowLeft size={14} className="text-[#B87333]" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED] font-serif tracking-tight">
          {ticketToEdit ? 'Edit Ticket' : 'Report an Issue'}
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] dark:text-[#888888] mt-1">
          Provide details so the community administration can resolve the issue promptly.
        </p>
      </div>

      <div className="bg-white/95 dark:bg-[#121212]/95 rounded-3xl border border-[#E5E0D8] dark:border-[#222222] overflow-hidden backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#777777] dark:text-[#A0A0A0] uppercase tracking-wider mb-2">
              Issue Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Street light broken in Block C"
              className={`w-full px-4 py-3 rounded-xl border bg-[#FAF7F2] dark:bg-[#171717] text-[#1A1A1A] dark:text-[#F5F2ED] text-xs sm:text-sm focus:border-[#B87333] outline-none transition-all ${
                formErrors.title ? 'border-rose-500' : 'border-[#D5CEC2] dark:border-[#292929]'
              }`}
            />
            {formErrors.title && <p className="mt-1.5 text-xs text-rose-500">{formErrors.title}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-[#777777] dark:text-[#A0A0A0] uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-[#D5CEC2] dark:border-[#292929] bg-[#FAF7F2] dark:bg-[#171717] text-[#1A1A1A] dark:text-[#F5F2ED] text-xs sm:text-sm focus:border-[#B87333] outline-none cursor-pointer capitalize"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-[#171717] text-[#1A1A1A] dark:text-[#F5F2ED] capitalize">{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-xs font-semibold text-[#777777] dark:text-[#A0A0A0] uppercase tracking-wider">
                Description & Details
              </label>
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={loadingSuggestion}
                className="flex items-center text-xs font-semibold text-[#B87333] hover:text-[#C98545] transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Sparkles size={14} className="mr-1 text-[#B87333]" />
                {loadingSuggestion ? 'Refining...' : 'AI Rephrase'}
              </button>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="mb-4 space-y-2 bg-[#FAF7F2] dark:bg-[#171717]/80 p-4 rounded-2xl border border-[#B87333]/30">
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#B87333] mb-2">
                  Pick a version to use:
                </p>
                <div className="grid gap-2">
                  {aiSuggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="text-left p-3 text-xs rounded-xl border border-[#E5E0D8] dark:border-[#262626] bg-white dark:bg-[#141414] hover:border-[#B87333] transition-all cursor-pointer"
                    >
                      <span className="text-[#333333] dark:text-[#D4D4D4] line-clamp-3 italic">
                        "{s}"
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAiSuggestions([])}
                    className="text-[10px] text-[#888888] dark:text-[#737373] hover:text-[#1A1A1A] dark:hover:text-[#A0A0A0] text-center w-full mt-1 cursor-pointer"
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
              placeholder="Describe the issue in detail..."
              className={`w-full px-4 py-3 rounded-xl border bg-[#FAF7F2] dark:bg-[#171717] text-[#1A1A1A] dark:text-[#F5F2ED] text-xs sm:text-sm focus:border-[#B87333] outline-none transition-all resize-none ${
                formErrors.description ? 'border-rose-500' : 'border-[#D5CEC2] dark:border-[#292929]'
              }`}
            />
            {formErrors.description && <p className="mt-1.5 text-xs text-rose-500">{formErrors.description}</p>}
          </div>

          {/* Submit Button with Crisp Copper Border */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/60 hover:border-[#B87333] text-[#1A1A1A] dark:text-[#F5F2ED] font-semibold py-3.5 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer backdrop-blur-md text-sm disabled:opacity-40"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              <Send size={18} className="mr-2 text-[#B87333]" />
            )}
            {ticketToEdit ? 'Update Ticket' : 'Submit Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTicket;
