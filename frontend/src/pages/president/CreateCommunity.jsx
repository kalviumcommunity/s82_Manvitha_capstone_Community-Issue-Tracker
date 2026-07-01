import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; // Updated path to context

const CreateCommunity = () => {
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth(); // Get user context to update state if needed

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => {
                const copy = { ...prev };
                delete copy[e.target.name];
                return copy;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Client-side validations
        const errors = {};
        if (formData.name.trim().length < 3) {
            errors.name = 'Community name must be at least 3 characters long.';
        }
        if (!formData.address.trim()) {
            errors.address = 'Address is required.';
        }
        if (!formData.city.trim()) {
            errors.city = 'City is required.';
        }
        if (!formData.contactPhone.trim()) {
            errors.contactPhone = 'Contact phone is required.';
        }
        if (!formData.contactEmail.trim()) {
            errors.contactEmail = 'Contact email is required.';
        } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
            errors.contactEmail = 'Please enter a valid email address.';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setFieldErrors({});
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:3551/api/v1/communities',
                {
                    name: formData.name,
                    city: formData.city,
                    address: formData.address,
                    contactPhone: formData.contactPhone,
                    contactEmail: formData.contactEmail,
                },
                { withCredentials: true }
            );

            // Directly redirect to dashboard
            window.location.href = '/president/dashboard'; // Force reload to refresh user cookie/context if needed

        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || 'Failed to create community.';
            
            // Map validation messages to fields
            if (errMsg.toLowerCase().includes('name')) {
                setFieldErrors({ name: 'Community name must be at least 3 characters long.' });
            } else if (errMsg.toLowerCase().includes('email')) {
                setFieldErrors({ contactEmail: 'Please enter a valid email address.' });
            } else {
                setError(errMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-lg border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    Create Your Community
                </h2>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Community Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                                fieldErrors.name ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                            }`}
                            placeholder="e.g., Sunrise Apartments"
                        />
                        {fieldErrors.name && (
                            <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Address
                        </label>
                        <input
                            name="address"
                            type="text"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                                fieldErrors.address ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                            }`}
                            placeholder="e.g., 123 Main St"
                        />
                        {fieldErrors.address && (
                            <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.address}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            City
                        </label>
                        <input
                            name="city"
                            type="text"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                                fieldErrors.city ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                            }`}
                            placeholder="e.g., New Delhi"
                        />
                        {fieldErrors.city && (
                            <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.city}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Contact Phone
                            </label>
                            <input
                                name="contactPhone"
                                type="tel"
                                required
                                value={formData.contactPhone}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                                    fieldErrors.contactPhone ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                                }`}
                                placeholder="Phone number"
                            />
                            {fieldErrors.contactPhone && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.contactPhone}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Contact Email
                            </label>
                            <input
                                name="contactEmail"
                                type="email"
                                required
                                value={formData.contactEmail}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                                    fieldErrors.contactEmail ? 'border-red-500 dark:border-red-500 focus:ring-red-500' : ''
                                }`}
                                placeholder="Email address"
                            />
                            {fieldErrors.contactEmail && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.contactEmail}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Community'}
                    </button>
                </form>

                <button
                    onClick={() => navigate('/president/dashboard')}
                    className="w-full mt-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CreateCommunity;
