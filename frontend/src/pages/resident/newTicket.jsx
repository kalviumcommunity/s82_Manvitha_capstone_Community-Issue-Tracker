import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { mockTickets } from '../../data/mockData';

const NewTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
  });
  
  const categories = [
    'maintenance', 'security', 'noise', 'cleanliness', 'amenities', 'payments', 'other'
  ];
  
  const priorities = ['low', 'medium', 'high', 'urgent'];
  
  const validate = () => {
    const errors = {
      title: '',
      description: '',
      category: '',
      priority: '',
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
    
    if (!formData.priority) {
      errors.priority = 'Priority is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // In a real app, we'd make an API call here
    // For this demo, we'll just add it to our mock data
    const newTicket = {
      id: `t${mockTickets.length + 1}`,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: 'open',
      createdBy: user?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      unit: user?.unit || '',
    };
    
    // Add to mock data (in a real app, this would be an API call)
    mockTickets.push(newTicket);
    
    // Add notification
    addNotification({
      userId: user?.id || '',
      title: 'Ticket Created',
      message: `Your ticket "${formData.title}" has been created successfully.`,
      read: false,
      type: 'ticket',
      linkTo: `/tickets/${newTicket.id}`,
    });
    
    // Redirect to my tickets page
    navigate('/resident/my-tickets');
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
          Submit a New Ticket
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
              </div>
              
              {/* Category & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <option value="" disabled>Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category} className="capitalize">
                        {category}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                  )}
                </div>
                
                <div>
                  <label 
                    htmlFor="priority" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md ${
                      formErrors.priority 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                    } shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700`}
                  >
                    <option value="" disabled>Select a priority</option>
                    {priorities.map(priority => (
                      <option key={priority} value={priority} className="capitalize">
                        {priority}
                      </option>
                    ))}
                  </select>
                  {formErrors.priority && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.priority}</p>
                  )}
                </div>
              </div>
              
              {formData.priority === 'urgent' && (
                <div className="flex p-4 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                  <AlertTriangle className="flex-shrink-0 w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                  <div className="ml-3 text-sm text-yellow-700 dark:text-yellow-400">
                    <p>You are submitting this ticket as <strong>Urgent</strong>. Please only use this priority for issues that require immediate attention, such as:</p>
                    <ul className="mt-1.5 ml-4 list-disc">
                      <li>Safety hazards</li>
                      <li>Water/gas leaks</li>
                      <li>Complete loss of essential utilities</li>
                      <li>Security breaches</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Send size={16} className="mr-2" />
                  Submit Ticket
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
