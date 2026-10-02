import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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
    const { user } = useAuth();

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
            await axios.post('https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1/communities',
                {
                    name: formData.name,
                    city: formData.city,
                    address: formData.address,
                    contactPhone: formData.contactPhone,
                    contactEmail: formData.contactEmail,
                },
                { withCredentials: true }
            );

            window.location.href = '/president/dashboard';

        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || 'Failed to create community.';
            
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
        <div className="flex items-center justify-center min-h-[calc(100vh-2rem)] p-4">
            <div className="bg-[#121212]/95 border border-[#262626] p-8 rounded-3xl w-full max-w-lg backdrop-blur-xl">
                <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#B87333]/15 border border-[#B87333]/30 text-[#E5A96A] flex items-center justify-center mx-auto mb-3">
                        <Building size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-[#F5F2ED] font-serif">
                        Create Your Community
                    </h2>
                    <p className="text-xs sm:text-sm text-[#888888] mt-1">
                        Set up your community workspace to begin onboarding users and managing tickets.
                    </p>
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 p-3.5 rounded-xl mb-4 text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#A0A0A0] uppercase mb-1">
                            Community Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 border rounded-xl bg-[#171717] text-[#F5F2ED] text-xs sm:text-sm focus:border-[#B87333]/60 outline-none ${
                                fieldErrors.name ? 'border-rose-500' : 'border-[#292929]'
                            }`}
                            placeholder="e.g., Sunrise Apartments"
                        />
                        {fieldErrors.name && (
                            <p className="mt-1 text-xs text-rose-400">{fieldErrors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#A0A0A0] uppercase mb-1">
                            Address
                        </label>
                        <input
                            name="address"
                            type="text"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 border rounded-xl bg-[#171717] text-[#F5F2ED] text-xs sm:text-sm focus:border-[#B87333]/60 outline-none ${
                                fieldErrors.address ? 'border-rose-500' : 'border-[#292929]'
                            }`}
                            placeholder="e.g., 123 Main St"
                        />
                        {fieldErrors.address && (
                            <p className="mt-1 text-xs text-rose-400">{fieldErrors.address}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#A0A0A0] uppercase mb-1">
                            City
                        </label>
                        <input
                            name="city"
                            type="text"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            className={`w-full px-4 py-2.5 border rounded-xl bg-[#171717] text-[#F5F2ED] text-xs sm:text-sm focus:border-[#B87333]/60 outline-none ${
                                fieldErrors.city ? 'border-rose-500' : 'border-[#292929]'
                            }`}
                            placeholder="e.g., New Delhi"
                        />
                        {fieldErrors.city && (
                            <p className="mt-1 text-xs text-rose-400">{fieldErrors.city}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#A0A0A0] uppercase mb-1">
                                Contact Phone
                            </label>
                            <input
                                name="contactPhone"
                                type="tel"
                                required
                                value={formData.contactPhone}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 border rounded-xl bg-[#171717] text-[#F5F2ED] text-xs sm:text-sm focus:border-[#B87333]/60 outline-none ${
                                    fieldErrors.contactPhone ? 'border-rose-500' : 'border-[#292929]'
                                }`}
                                placeholder="Phone number"
                            />
                            {fieldErrors.contactPhone && (
                                <p className="mt-1 text-xs text-rose-400">{fieldErrors.contactPhone}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#A0A0A0] uppercase mb-1">
                                Contact Email
                            </label>
                            <input
                                name="contactEmail"
                                type="email"
                                required
                                value={formData.contactEmail}
                                onChange={handleChange}
                                className={`w-full px-4 py-2.5 border rounded-xl bg-[#171717] text-[#F5F2ED] text-xs sm:text-sm focus:border-[#B87333]/60 outline-none ${
                                    fieldErrors.contactEmail ? 'border-rose-500' : 'border-[#292929]'
                                }`}
                                placeholder="Email address"
                            />
                            {fieldErrors.contactEmail && (
                                <p className="mt-1 text-xs text-rose-400">{fieldErrors.contactEmail}</p>
                            )}
                        </div>
                    </div>

                    {/* Glassy Submit Button - Zero drop shadows */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/50 hover:border-[#B87333] text-[#F5F2ED] font-semibold py-3 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                        {loading ? 'Creating Community...' : 'Create Community'}
                    </button>
                </form>

                <button
                    onClick={() => navigate('/president/dashboard')}
                    className="w-full mt-3 text-[#737373] hover:text-[#F5F2ED] text-xs transition-colors py-2 cursor-pointer"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CreateCommunity;
