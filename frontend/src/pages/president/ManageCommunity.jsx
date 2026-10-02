import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, ShieldAlert, UserCheck, Loader2, AlertTriangle, Phone, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import PartyPopperCelebration from '../../components/common/PartyPopperCelebration';

const api = axios.create({
    baseURL: 'https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1',
    withCredentials: true,
});

const ManageCommunity = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { addNotification } = useNotifications();

    const [residents, setResidents] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvalsLoading, setApprovalsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirm, setShowConfirm] = useState(null);
    const [transferring, setTransferring] = useState(false);
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'residents');
    const [decisionLoadingId, setDecisionLoadingId] = useState(null);
    const [celebrationMember, setCelebrationMember] = useState(null);

    useEffect(() => {
        if (user) {
            fetchResidents();
            fetchPendingApprovals();
        }
    }, [user]);

    const fetchResidents = async () => {
        if (!user?.communityId) return;
        try {
            setLoading(true);
            const res = await api.get(`/communities/${user.communityId}/residents`);
            setResidents(res.data);
        } catch (err) {
            console.error("Error fetching users:", err);
            addNotification({ title: 'Error', message: 'Failed to load community users', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingApprovals = async () => {
        if (!user?.communityId) return;
        try {
            setApprovalsLoading(true);
            const res = await api.get('/approvals/pending');
            setPendingApprovals(res.data);
        } catch (err) {
            console.error("Error fetching pending approvals:", err);
            addNotification({ title: 'Error', message: 'Failed to load pending requests', type: 'error' });
        } finally {
            setApprovalsLoading(false);
        }
    };

    const handleTransfer = async (targetUserId) => {
        try {
            setTransferring(true);
            await api.post('/communities/transfer-ownership', { newPresidentId: targetUserId });

            addNotification({ title: 'Success', message: 'Admin role transferred. You are now a standard user.' });
            window.location.reload();

        } catch (err) {
            console.error("Transfer failed:", err);
            addNotification({ title: 'Error', message: err.response?.data?.message || 'Transfer failed', type: 'error' });
            setTransferring(false);
            setShowConfirm(null);
        }
    };

    const handleDecision = async (approvalId, decision, requesterName = '') => {
        try {
            setDecisionLoadingId(approvalId);
            await api.post(`/approvals/${approvalId}/decision`, { decision });
            
            if (decision === 'APPROVED') {
                setCelebrationMember({
                    name: requesterName,
                    communityName: user?.communityName || 'the community'
                });
            } else {
                addNotification({ 
                    title: 'Request Declined', 
                    message: `Join request for ${requesterName || 'user'} was declined.`,
                    type: 'info'
                });
            }
            
            fetchPendingApprovals();
            if (decision === 'APPROVED') {
                fetchResidents();
            }
        } catch (err) {
            console.error("Failed to make decision:", err);
            addNotification({ 
                title: 'Error', 
                message: err.response?.data?.message || 'Action failed', 
                type: 'error' 
            });
        } finally {
            setDecisionLoadingId(null);
        }
    };

    const handleRemoveResident = async (residentId) => {
        if (!window.confirm("Are you sure you want to remove this user from the community? They will lose access to all community announcements, tickets, and features.")) return;
        try {
            await api.delete(`/communities/${user.communityId}/residents/${residentId}`);
            addNotification({ title: 'Success', message: 'User removed from community successfully.' });
            fetchResidents();
        } catch (err) {
            console.error("Failed to remove user:", err);
            addNotification({ title: 'Error', message: err.response?.data?.message || 'Failed to remove user', type: 'error' });
        }
    };

    const filteredResidents = residents.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPending = pendingApprovals.filter(r => {
        if (!r.requesterId) return false;
        const name = r.requesterId.name || '';
        const email = r.requesterId.email || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED] flex items-center gap-2.5 font-serif">
                    <ShieldAlert className="text-[#B87333]" size={28} />
                    Manage Community
                </h1>
                <p className="text-xs sm:text-sm text-[#666666] dark:text-[#888888] mt-1.5">
                    View active community members, manage administrative roles, and approve joining requests.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E5E0D8] dark:border-[#222222]">
                <button
                    onClick={() => setActiveTab('residents')}
                    className={`py-3 px-5 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'residents'
                            ? 'border-[#B87333] text-[#B87333] dark:text-[#F5F2ED]'
                            : 'border-transparent text-[#777777] dark:text-[#737373] hover:text-[#1A1A1A] dark:hover:text-[#D4D4D4]'
                    }`}
                >
                    <UserCheck size={16} />
                    Active Users ({residents.length})
                </button>
                <button
                    onClick={() => setActiveTab('approvals')}
                    className={`py-3 px-5 font-semibold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer relative ${
                        activeTab === 'approvals'
                            ? 'border-[#B87333] text-[#B87333] dark:text-[#F5F2ED]'
                            : 'border-transparent text-[#777777] dark:text-[#737373] hover:text-[#1A1A1A] dark:hover:text-[#D4D4D4]'
                    }`}
                >
                    <UserPlus size={16} />
                    Pending Join Requests
                    {pendingApprovals.length > 0 && (
                        <span className="ml-1.5 px-2 py-0.5 text-[10px] bg-[#B87333] text-white dark:text-[#080808] rounded-full font-bold animate-pulse">
                            {pendingApprovals.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Search Input with Copper Focus Border */}
            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888] dark:text-[#737373]" size={18} />
                <input
                    type="text"
                    placeholder={
                        activeTab === 'residents' 
                            ? "Search users by name or email..." 
                            : "Search pending requests by name or email..."
                    }
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white dark:bg-[#121212]/80 border-[#D5CEC2] dark:border-[#262626] text-[#1A1A1A] dark:text-[#F5F2ED] focus:border-[#B87333] outline-none text-xs sm:text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {activeTab === 'residents' ? (
                /* Active Users List */
                <div className="bg-white/95 dark:bg-[#121212]/90 rounded-2xl border border-[#E5E0D8] dark:border-[#222222] overflow-hidden backdrop-blur-md">
                    <div className="p-4 border-b border-[#E5E0D8] dark:border-[#222222] bg-[#FAF7F2] dark:bg-[#171717]/50">
                        <h2 className="font-semibold text-xs text-[#1A1A1A] dark:text-[#F5F2ED] uppercase tracking-wider">
                            Active Users ({filteredResidents.length})
                        </h2>
                    </div>

                    <div className="divide-y divide-[#EAE5DD] dark:divide-[#1F1F1F]">
                        {loading ? (
                            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-[#B87333]" /></div>
                        ) : filteredResidents.length > 0 ? (
                            filteredResidents.map(resident => (
                                <div key={resident._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2] dark:hover:bg-[#171717]/40 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={resident.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.name)}&background=1E1E1E&color=E5A96A`}
                                            alt={resident.name}
                                            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2E2E2E]"
                                        />
                                        <div>
                                            <h3 className="font-medium text-sm text-[#1A1A1A] dark:text-[#F5F2ED]">{resident.name}</h3>
                                            <p className="text-xs text-[#777777] dark:text-[#737373]">{resident.email}</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {resident.phoneNumber && (
                                                    <span className="text-[11px] bg-[#B87333]/15 text-[#8B4513] dark:text-[#E5A96A] border border-[#B87333]/25 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                        <Phone size={10} /> {resident.phoneNumber}
                                                    </span>
                                                )}
                                                {resident.profile?.houseNo && (
                                                    <span className="text-[11px] bg-gray-100 dark:bg-[#1E1E1E] text-gray-700 dark:text-[#A0A0A0] border border-gray-200 dark:border-[#292929] px-2 py-0.5 rounded-md">
                                                        {resident.profile.houseNo} {resident.profile.block ? `- ${resident.profile.block}` : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons with copper border */}
                                    <div className="flex gap-2 self-end sm:self-center">
                                        <button
                                            onClick={() => setShowConfirm(resident._id)}
                                            className="px-3 py-1.5 text-xs font-semibold text-[#8B4513] dark:text-[#E5A96A] bg-[#B87333]/15 hover:bg-[#B87333]/25 dark:bg-[#1A1A1A] hover:dark:bg-[#222222] border border-[#B87333]/50 hover:border-[#B87333] rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md"
                                        >
                                            Make Admin
                                        </button>
                                        <button
                                            onClick={() => handleRemoveResident(resident._id)}
                                            className="px-3 py-1.5 text-xs font-semibold text-[#777777] dark:text-[#737373] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-300 dark:hover:border-rose-500/30 rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-xs text-[#777777] dark:text-[#737373]">
                                No users found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Pending Join Requests List */
                <div className="bg-white/95 dark:bg-[#121212]/90 rounded-2xl border border-[#E5E0D8] dark:border-[#222222] overflow-hidden backdrop-blur-md">
                    <div className="p-4 border-b border-[#E5E0D8] dark:border-[#222222] bg-[#FAF7F2] dark:bg-[#171717]/50">
                        <h2 className="font-semibold text-xs text-[#1A1A1A] dark:text-[#F5F2ED] uppercase tracking-wider">
                            Pending Requests ({filteredPending.length})
                        </h2>
                    </div>

                    <div className="divide-y divide-[#EAE5DD] dark:divide-[#1F1F1F]">
                        {approvalsLoading ? (
                            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-[#B87333]" /></div>
                        ) : filteredPending.length > 0 ? (
                            filteredPending.map(approval => {
                                const requester = approval.requesterId;
                                if (!requester) return null;
                                return (
                                    <div key={approval._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2] dark:hover:bg-[#171717]/40 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={requester.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(requester.name)}&background=1E1E1E&color=E5A96A`}
                                                alt={requester.name}
                                                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#2E2E2E]"
                                            />
                                            <div>
                                                <h3 className="font-medium text-sm text-[#1A1A1A] dark:text-[#F5F2ED]">{requester.name}</h3>
                                                <p className="text-xs text-[#777777] dark:text-[#737373]">{requester.email}</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {requester.phoneNumber && (
                                                        <span className="text-[11px] bg-[#B87333]/15 text-[#8B4513] dark:text-[#E5A96A] border border-[#B87333]/25 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                            <Phone size={10} /> {requester.phoneNumber}
                                                        </span>
                                                    )}
                                                    {requester.profile?.houseNo && (
                                                        <span className="text-[11px] bg-gray-100 dark:bg-[#1E1E1E] text-gray-700 dark:text-[#A0A0A0] border border-gray-200 dark:border-[#292929] px-2 py-0.5 rounded-md">
                                                            House No: {requester.profile.houseNo}
                                                        </span>
                                                    )}
                                                    <span className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                                        Requested: {new Date(approval.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            <button
                                                disabled={decisionLoadingId !== null}
                                                onClick={() => handleDecision(approval._id, 'APPROVED', requester.name)}
                                                className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/35 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                                            >
                                                {decisionLoadingId === approval._id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                Approve
                                            </button>
                                            <button
                                                disabled={decisionLoadingId !== null}
                                                onClick={() => handleDecision(approval._id, 'REJECTED', requester.name)}
                                                className="px-3.5 py-1.5 text-xs font-semibold bg-rose-500/15 hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-500/35 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                                            >
                                                {decisionLoadingId === approval._id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                                                Decline
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-xs text-[#777777] dark:text-[#737373]">
                                No pending join requests.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Transfer Admin Rights Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white dark:bg-[#121212]/95 border border-[#E5E0D8] dark:border-[#262626] rounded-3xl max-w-md w-full p-6 text-[#1A1A1A] dark:text-[#F5F2ED] backdrop-blur-2xl">
                        <div className="flex items-center gap-3 text-amber-500 mb-4">
                            <AlertTriangle size={26} />
                            <h2 className="text-lg font-bold font-serif">Transfer Admin Rights?</h2>
                        </div>

                        <p className="text-xs sm:text-sm text-[#666666] dark:text-[#A0A0A0] mb-4">
                            Are you sure you want to transfer Admin rights to this user?
                        </p>

                        <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 mb-6">
                            <ul className="text-xs text-amber-700 dark:text-amber-300/90 space-y-1.5 list-disc list-inside">
                                <li>You will immediately become a <strong>standard User</strong>.</li>
                                <li>You will lose all admin privileges (managing members, community settings).</li>
                                <li>This action <strong>cannot be undone</strong> by you.</li>
                            </ul>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(null)}
                                disabled={transferring}
                                className="px-4 py-2 text-xs font-semibold text-[#666666] dark:text-[#A0A0A0] hover:text-[#1A1A1A] dark:hover:text-[#F5F2ED] bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#222222] border border-[#D5CEC2] dark:border-[#292929] rounded-xl transition-all duration-200 cursor-pointer backdrop-blur-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleTransfer(showConfirm)}
                                disabled={transferring}
                                className="px-4 py-2 text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 border border-rose-500/40 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer backdrop-blur-md"
                            >
                                {transferring ? <Loader2 className="animate-spin" size={16} /> : <UserCheck size={16} />}
                                Confirm Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Celebration Party Popper Pop-up on Member Approval */}
            {celebrationMember && (
                <PartyPopperCelebration
                    memberName={celebrationMember.name}
                    communityName={celebrationMember.communityName}
                    onClose={() => setCelebrationMember(null)}
                />
            )}
        </div>
    );
};

export default ManageCommunity;
