import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import axios from 'axios';
import { User, Home, Phone, Mail, MapPin, Building, ShieldCheck, Loader2 } from 'lucide-react';

const api = axios.create({
    baseURL: 'http://localhost:3551/api/v1',
    withCredentials: true,
});

const Profile = () => {
    const { user, setUser } = useAuth(); // Assuming AuthContext provides setUser or we can reload
    const { addNotification } = useNotifications();
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [communitySaving, setCommunitySaving] = useState(false);
    const [isEditingCommunity, setIsEditingCommunity] = useState(false);
    const [communityFormData, setCommunityFormData] = useState({
        name: '',
        contactPhone: '',
        contactEmail: '',
        address: '',
    });
    const [editFormData, setEditFormData] = useState({
        name: user?.name || '',
        phoneNumber: user?.phoneNumber || '',
        houseNo: user?.profile?.houseNo || '',
        ownerName: user?.profile?.ownerName || '',
    });
    const [saving, setSaving] = useState(false);

    // 1. Sync User Edit Form
    useEffect(() => {
        if (user) {
            setEditFormData({
                name: user.name || '',
                phoneNumber: user.phoneNumber || '',
                houseNo: user.profile?.houseNo || '',
                ownerName: user.profile?.ownerName || '',
            });
        }
    }, [user]);

    // 2. Fetch Community & Sync Form
    useEffect(() => {
        const fetchCommunity = async () => {
            if (!user?.communityId) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get(`/communities/${user.communityId}`);
                setCommunity(res.data);
                setCommunityFormData({
                    name: res.data.name || '',
                    contactPhone: res.data.contactPhone || '',
                    contactEmail: res.data.contactEmail || '',
                    address: res.data.location?.address || '',
                });
            } catch (err) {
                console.error('Error fetching community details:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunity();
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCommunityInputChange = (e) => {
        const { name, value } = e.target;
        setCommunityFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.patch('/auth/me', editFormData);
            if (setUser) {
                setUser(res.data.user);
            } else {
                window.location.reload();
            }
            setIsEditing(false);
            addNotification({ title: 'Success', message: 'Profile updated successfully', type: 'success' });
        } catch (err) {
            console.error('Error saving profile:', err);
            addNotification({ title: 'Error', message: 'Failed to save profile changes', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleCommunitySave = async (e) => {
        e.preventDefault();
        setCommunitySaving(true);
        try {
            const res = await api.patch(`/communities/${user.communityId}`, communityFormData);
            setCommunity(res.data);
            setIsEditingCommunity(false);
            addNotification({ title: 'Success', message: 'Community details updated successfully', type: 'success' });
        } catch (err) {
            console.error('Error saving community:', err);
            addNotification({ title: 'Error', message: 'Failed to save community changes', type: 'error' });
        } finally {
            setCommunitySaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    const memberSinceDate = user?.createdAt ? new Date(user.createdAt) : null;
    const formattedDate = memberSinceDate && !isNaN(memberSinceDate.getTime())
        ? memberSinceDate.toLocaleDateString()
        : 'Joining soon';

    return (
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
                    <div className="bg-blue-600 h-24 relative">
                        <div className="absolute -bottom-10 left-6">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`}
                                alt={user.name}
                                className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-md"
                            />
                        </div>
                    </div>
                    <div className="pt-12 p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <ShieldCheck size={14} className="text-blue-500" />
                                {user.role}
                            </p>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                                    <input
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
                                    <input
                                        name="phoneNumber"
                                        value={editFormData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="Provide phone number"
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {user.role === 'RESIDENT' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">House No</label>
                                            <input
                                                name="houseNo"
                                                value={editFormData.houseNo}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Owner Name</label>
                                            <input
                                                name="ownerName"
                                                value={editFormData.ownerName}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-2 pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <Mail size={18} className="text-gray-400" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <Phone size={18} className="text-gray-400" />
                                    <span className={!user.phoneNumber ? 'text-gray-400 italic' : ''}>
                                        {user.phoneNumber || 'Not provided'}
                                    </span>
                                </div>

                                {user.role === 'RESIDENT' && (
                                    <>
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <Home size={18} className="text-gray-400" />
                                            <span>House No: <span className="font-semibold">{user.profile?.houseNo || 'Not provided'}</span></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <User size={18} className="text-gray-400" />
                                            <span>Owner Name: <span className="font-semibold">{user.profile?.ownerName || 'Not provided'}</span></span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Community Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold uppercase text-xs tracking-widest">
                            <Building size={16} />
                            Community Details
                        </div>
                        {user.role === 'PRESIDENT' && !isEditingCommunity && (
                            <button
                                onClick={() => setIsEditingCommunity(true)}
                                className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
                            >
                                Edit Community
                            </button>
                        )}
                    </div>

                    {community ? (
                        <div className="flex-1 flex flex-col justify-between">
                            {isEditingCommunity ? (
                                <form onSubmit={handleCommunitySave} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Community Name</label>
                                        <input
                                            name="name"
                                            value={communityFormData.name}
                                            onChange={handleCommunityInputChange}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contact Phone</label>
                                        <input
                                            name="contactPhone"
                                            value={communityFormData.contactPhone}
                                            onChange={handleCommunityInputChange}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Contact Email</label>
                                        <input
                                            name="contactEmail"
                                            value={communityFormData.contactEmail}
                                            onChange={handleCommunityInputChange}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Address</label>
                                        <input
                                            name="address"
                                            value={communityFormData.address}
                                            onChange={handleCommunityInputChange}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="submit"
                                            disabled={communitySaving}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm disabled:opacity-50"
                                        >
                                            {communitySaving ? 'Saving...' : 'Save Community'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingCommunity(false)}
                                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-bold text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{community.name}</h3>
                                            <p className="text-xs text-gray-400 font-mono">Community Code: {community.code}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                                <MapPin size={18} className="text-gray-400 mt-1" />
                                                <div>
                                                    <p className="font-medium">Location</p>
                                                    <p className="text-sm text-gray-500">
                                                        {community.location?.address ? `${community.location.address}, ` : ''}
                                                        {community.location?.city}, {community.location?.state}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                                <Phone size={18} className="text-gray-400 mt-1" />
                                                <div>
                                                    <p className="font-medium">Management Phone</p>
                                                    <p className="text-sm text-gray-500">{community.contactPhone || 'Not available'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                                                <Mail size={18} className="text-gray-400 mt-1" />
                                                <div>
                                                    <p className="font-medium">Management Email</p>
                                                    <p className="text-sm text-gray-500">{community.contactEmail || 'Not available'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t dark:border-gray-700 mt-auto">
                                        <p className="text-xs text-gray-400">Member since {formattedDate}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 italic">No community joined yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
