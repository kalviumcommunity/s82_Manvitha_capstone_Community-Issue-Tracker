import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const NewTicket = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ticketToEdit = location.state?.ticketToEdit;
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    category: '',
  });

  const [userId, setUserId] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      const id = decoded.id || decoded._id;
      setUserId(id);
    }

    if (ticketToEdit) {
      setFormData({
        title: ticketToEdit.title || '',
        description: ticketToEdit.description || '',
        category: ticketToEdit.category || '',
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
    const errors = {
      title: '',
      description: '',
      category: '',
    };

    let isValid = true;

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }

    if (!formData.category) {
      errors.category = 'Category is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAutoFill = async () => {
    if (!formData.title.trim()) {
      setFormErrors((prev) => ({
        ...prev,
        title: 'Title is required for AI suggestion.',
      }));
      return;
    }

    try {
      setLoadingSuggestion(true);

      const res = await axios.post('http://localhost:3551/api/autocomplete', {
        prompt: `Write a detailed description for the resident issue titled: "${formData.title}"`,
      });

      const suggestion = res.data?.suggestion;
      if (suggestion) {
        setFormData((prev) => ({ ...prev, description: suggestion }));
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
      alert('Failed to generate description. Try again later.');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (!userId) {
      alert('User not authenticated. Please login again.');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      if (ticketToEdit?._id) {
        // Update existing ticket
        await axios.put(
          `http://localhost:3551/api/issues/updatedIssues/${ticketToEdit._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        addNotification({
          userId: user?.id || '',
          title: 'Ticket Updated',
          message: `Your ticket "${formData.title}" has been updated successfully.`,
          read: false,
          type: 'ticket',
          linkTo: `/tickets/${ticketToEdit._id}`,
        });

        navigate('/resident/my-tickets');
      } else {
        // Create new ticket
        const response = await axios.post(
          'http://localhost:3551/api/issues/create',
          {
            ...formData,
            createdBy: userId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const result = response.data;

        addNotification({
          userId: user?.id || '',
          title: 'Ticket Created',
          message: `Your ticket "${formData.title}" has been created successfully.`,
          read: false,
          type: 'ticket',
          linkTo: `/tickets/${result.savedIssue._id}`,
        });

        navigate('/resident/my-tickets');
      }
    } catch (error) {
      console.error(
        'Error submitting ticket:',
        error.response?.data?.message || error.message
      );
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/resident')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {ticketToEdit ? 'Edit Ticket' : 'Submit a New Ticket'}
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
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
                  placeholder="Briefly describe the issue"
                  className={`mt-1 block w-full rounded-md ${
                    formErrors.title
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  } shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700`}
                />
                {formErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Please provide detailed information about the issue"
                  className={`mt-1 block w-full rounded-md ${
                    formErrors.description
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  } shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={loadingSuggestion}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    {loadingSuggestion ? 'Generating description...' : 'Autofill with AI'}
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md ${
                    formErrors.category
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                  } shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700`}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="capitalize">
                      {category}
                    </option>
                  ))}
                </select>
                {formErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Send size={16} className="mr-2" />
                  {ticketToEdit ? 'Update Ticket' : 'Submit Ticket'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTicket;
