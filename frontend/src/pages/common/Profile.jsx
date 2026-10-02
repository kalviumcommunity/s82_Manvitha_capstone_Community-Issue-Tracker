import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import axios from 'axios';
import { User, Home, Phone, Mail, MapPin, Building, ShieldCheck, Loader2 } from 'lucide-react';

const api = axios.create({
    baseURL: 'https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1',
    withCredentials: true,
});

const Profile = () => {
    const { user, setUser } = useAuth();
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
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-[#B87333]" size={36} />
            </div>
        );
    }

    const memberSinceDate = user?.createdAt ? new Date(user.createdAt) : null;
    const formattedDate = memberSinceDate && !isNaN(memberSinceDate.getTime())
        ? memberSinceDate.toLocaleDateString()
        : 'Active';

    const roleDisplay = user?.role === 'PRESIDENT' ? 'Admin' : 'User';

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b border-[#222222] pb-5">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F2ED] font-serif tracking-tight">
                        Account Profile
                    </h1>
                    <p className="text-xs sm:text-sm text-[#888888] mt-1">
                        View and update your personal details and community association.
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/50 hover:border-[#B87333] text-[#F5F2ED] rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer backdrop-blur-md"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Details Card */}
                <div className="bg-[#121212]/95 rounded-3xl border border-[#222222] overflow-hidden backdrop-blur-xl">
                    <div className="bg-gradient-to-r from-[#B87333]/30 via-[#1F1F1F] to-[#121212] h-24 relative">
                        <div className="absolute -bottom-8 left-6">
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1A1A1A&color=E5A96A&size=128`}
                                alt={user.name}
                                className="w-18 h-18 rounded-2xl border-2 border-[#B87333]/40 bg-[#121212]"
                            />
                        </div>
                    </div>
                    <div className="pt-10 p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-[#F5F2ED] font-serif">{user.name}</h2>
                            <p className="text-xs text-[#E5A96A] flex items-center gap-1.5 mt-1 font-medium">
                                <ShieldCheck size={14} className="text-[#B87333]" />
                                {roleDisplay}
                            </p>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-semibold text-[#A0A0A0] uppercase mb-1">Full Name</label>
                                    <input
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3.5 py-2.5 bg-[#171717] border border-[#292929] rounded-xl text-xs sm:text-sm text-[#F5F2ED] focus:border-[#B87333]/60 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-[#A0A0A0] uppercase mb-1">Phone Number</label>
                                    <input
                                        name="phoneNumber"
                                        value={editFormData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="Phone number"
                                        className="w-full px-3.5 py-2.5 bg-[#171717] border border-[#292929] rounded-xl text-xs sm:text-sm text-[#F5F2ED] focus:border-[#B87333]/60 outline-none"
                                    />
                                </div>
                                {user.role === 'RESIDENT' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-[#A0A0A0] uppercase mb-1">House No</label>
                                            <input
                                                name="houseNo"
                                                value={editFormData.houseNo}
                                                onChange={handleInputChange}
                                                className="w-full px-3.5 py-2.5 bg-[#171717] border border-[#292929] rounded-xl text-xs sm:text-sm text-[#F5F2ED] focus:border-[#B87333]/60 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-[#A0A0A0] uppercase mb-1">Owner Name</label>
                                            <input
                                                name="ownerName"
                                                value={editFormData.ownerName}
                                                onChange={handleInputChange}
                                                className="w-full px-3.5 py-2.5 bg-[#171717] border border-[#292929] rounded-xl text-xs sm:text-sm text-[#F5F2ED] focus:border-[#B87333]/60 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-2.5 pt-3">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/50 hover:border-[#B87333] text-[#F5F2ED] rounded-xl font-semibold text-xs sm:text-sm cursor-pointer backdrop-blur-md"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#222222] border border-[#292929] text-[#A0A0A0] hover:text-[#F5F2ED] rounded-xl font-semibold text-xs sm:text-sm cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-3.5 text-xs sm:text-sm">
                                <div className="flex items-center gap-3 text-[#A0A0A0]">
                                    <Mail size={16} className="text-[#B87333]" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[#A0A0A0]">
                                    <Phone size={16} className="text-[#B87333]" />
                                    <span>{user.phoneNumber || 'Not provided'}</span>
                                </div>

                                {user.role === 'RESIDENT' && (
                                    <>
                                        <div className="flex items-center gap-3 text-[#A0A0A0]">
                                            <Home size={16} className="text-[#B87333]" />
                                            <span>House No: <strong className="text-[#F5F2ED]">{user.profile?.houseNo || 'Not provided'}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[#A0A0A0]">
                                            <User size={16} className="text-[#B87333]" />
                                            <span>Owner Name: <strong className="text-[#F5F2ED]">{user.profile?.ownerName || 'Not provided'}</strong></span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Community Details Card */}
                <div className="bg-[#121212]/95 rounded-3xl border border-[#222222] p-6 flex flex-col backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-[#E5A96A] font-semibold uppercase text-xs tracking-wider">
                            <Building size={16} className="text-[#B87333]" />
                            Community Details
                        </div>
                        {user.role === 'PRESIDENT' && !isEditingCommunity && (
                            <button
                                onClick={() => setIsEditingCommunity(true)}
                                className="text-[#B87333] hover:text-[#E5A96A] text-xs font-semibold cursor-pointer"
                            >
                                Edit Details
                            </button>
                        )}
                    </div>

                    {community ? (
                        <div className="flex-1 flex flex-col justify-between">
                            {isEditingCommunity ? (
                                <form onSubmit={handleCommunitySave} className="space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#A0A0A0] uppercase mb-1">Community Name</label>
                                        <input
                                            name="name"
                                            value={communityFormData.name}
                                            onChange={handleCommunityInputChange}
                                            className="w-full px-3.5 py-2.5 bg-[#171717] border border-[#292929] rounded-xl text-xs sm:text-sm text-[#F5F2ED] focus:border-[#B87333]/60 outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#A0A0A0] uppercase mb-1">Contact Phone</label>
                                        <input
                                            name="contactPhone"
                                            value={communityFormData.contactPhone}
                                            onChange={handleCommunityInputChange}
                                            className="w-full px-3.5 py-2.5 bg-[#171717] border border-[#292929] rounded-xl text-xs sm:text-sm text-[#F5F2ED] focus:border-[#B87333]/60 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#A0A0A0] uppercase mb-1">Contact Email</label>
                                        <input
                                            name="contactEmail"
                                            value={communityFormData.contactEmail}
                                            onChange={handleCommunityInputChange}
                                            className="w-full px-3.5 py-2.5 bg-[#171717] border border-[#292929] rounded-xl text-xs sm:text-sm text-[#F5F2ED] focus:border-[#B87333]/60 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-[#A0A0A0] uppercase mb-1">Address</label>
                                        <input
                                            name="address"
                                            value={communityFormData.address}
                                            onChange={handleCommunityInputChange}
                                            className="w-full px-3.5 py-2.5 bg-[#171717] border border-[#292929] rounded-xl text-xs sm:text-sm text-[#F5F2ED] focus:border-[#B87333]/60 outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2.5 pt-2">
                                        <button
                                            type="submit"
                                            disabled={communitySaving}
                                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#B87333]/25 via-[#B87333]/20 to-[#B87333]/15 hover:from-[#B87333]/35 hover:to-[#B87333]/25 dark:bg-none dark:bg-[#141414] hover:dark:bg-[#1E1E1E] border border-[#B87333]/50 hover:border-[#B87333] text-[#F5F2ED] rounded-xl font-semibold text-xs sm:text-sm cursor-pointer backdrop-blur-md"
                                        >
                                            {communitySaving ? 'Saving...' : 'Save Community'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingCommunity(false)}
                                            className="flex-1 px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#222222] border border-[#292929] text-[#A0A0A0] hover:text-[#F5F2ED] rounded-xl font-semibold text-xs sm:text-sm cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="space-y-5">
                                        <div>
                                            <h3 className="text-base font-semibold text-[#F5F2ED] mb-1 font-serif">{community.name}</h3>
                                            <p className="text-xs text-[#B87333] font-mono">Community Code: {community.code}</p>
                                        </div>

                                        <div className="space-y-3.5 text-xs sm:text-sm">
                                            <div className="flex items-start gap-3 text-[#A0A0A0]">
                                                <MapPin size={16} className="text-[#B87333] mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-medium text-[#F5F2ED]">Location</p>
                                                    <p className="text-xs text-[#737373]">
                                                        {community.location?.address ? `${community.location.address}, ` : ''}
                                                        {community.location?.city}, {community.location?.state}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 text-[#A0A0A0]">
                                                <Phone size={16} className="text-[#B87333] mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-medium text-[#F5F2ED]">Management Phone</p>
                                                    <p className="text-xs text-[#737373]">{community.contactPhone || 'Not available'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 text-[#A0A0A0]">
                                                <Mail size={16} className="text-[#B87333] mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="font-medium text-[#F5F2ED]">Management Email</p>
                                                    <p className="text-xs text-[#737373]">{community.contactEmail || 'Not available'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-[#222222] mt-6">
                                        <p className="text-[11px] text-[#737373]">Member since {formattedDate}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-xs sm:text-sm text-[#737373]">No community joined yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
