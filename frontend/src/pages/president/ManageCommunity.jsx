import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Search, ShieldAlert, UserCheck, Loader2, AlertTriangle, Phone, UserPlus, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

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
    const [showConfirm, setShowConfirm] = useState(null); // ID of user to confirm
    const [transferring, setTransferring] = useState(false);
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'residents'); // 'residents' or 'approvals'
    const [decisionLoadingId, setDecisionLoadingId] = useState(null);

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
            console.error("Error fetching residents:", err);
            addNotification({ title: 'Error', message: 'Failed to load residents', type: 'error' });
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

            addNotification({ title: 'Success', message: 'Presidency transferred. You are now a resident.' });

            // Force reload to refresh permissions
            window.location.reload();

        } catch (err) {
            console.error("Transfer failed:", err);
            addNotification({ title: 'Error', message: err.response?.data?.message || 'Transfer failed', type: 'error' });
            setTransferring(false);
            setShowConfirm(null);
        }
    };

    const handleDecision = async (approvalId, decision) => {
        try {
            setDecisionLoadingId(approvalId);
            await api.post(`/approvals/${approvalId}/decision`, { decision });
            addNotification({ 
                title: 'Success', 
                message: `Join request was successfully ${decision === 'APPROVED' ? 'approved' : 'rejected'}.` 
            });
            
            // Refresh tables
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
        if (!window.confirm("Are you sure you want to remove this resident from the community? They will lose access to all community announcements, tickets, and features.")) return;
        try {
            await api.delete(`/communities/${user.communityId}/residents/${residentId}`);
            addNotification({ title: 'Success', message: 'Resident removed from community successfully.' });
            fetchResidents();
        } catch (err) {
            console.error("Failed to remove resident:", err);
            addNotification({ title: 'Error', message: err.response?.data?.message || 'Failed to remove resident', type: 'error' });
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
        <div className="p-4 lg:p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="text-blue-600" />
                    Manage Community
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    View active residents, manage community leadership, and moderate joining requests.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('residents')}
                    className={`py-3 px-6 font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'residents'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-450 dark:border-blue-450'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <UserCheck size={18} />
                    Active Residents ({residents.length})
                </button>
                <button
                    onClick={() => setActiveTab('approvals')}
                    className={`py-3 px-6 font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer relative ${
                        activeTab === 'approvals'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-450 dark:border-blue-450'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                    <UserPlus size={18} />
                    Pending Join Requests
                    {pendingApprovals.length > 0 && (
                        <span className="ml-1.5 px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full font-bold animate-pulse">
                            {pendingApprovals.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder={
                        activeTab === 'residents' 
                            ? "Search residents by name or email..." 
                            : "Search pending requests by name or email..."
                    }
                    className="w-full pl-10 pr-4 py-2.5 border rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {activeTab === 'residents' ? (
                /* Residents List */
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="font-semibold text-gray-700 dark:text-gray-200">Residents ({filteredResidents.length})</h2>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>
                        ) : filteredResidents.length > 0 ? (
                            filteredResidents.map(resident => (
                                <div key={resident._id} className="p-4 flex items-center justify-between hover:bg-gray-55 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={resident.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.name)}`}
                                            alt={resident.name}
                                            className="w-10 h-10 rounded-full bg-gray-200"
                                        />
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">{resident.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{resident.email}</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {resident.phoneNumber && (
                                                    <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <Phone size={10} /> {resident.phoneNumber}
                                                    </span>
                                                )}
                                                {resident.profile?.houseNo && (
                                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                                        {resident.profile.houseNo} {resident.profile.block ? `- ${resident.profile.block}` : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowConfirm(resident._id)}
                                            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-transparent hover:border-blue-200 cursor-pointer"
                                        >
                                            Make President
                                        </button>
                                        <button
                                            onClick={() => handleRemoveResident(resident._id)}
                                            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-205 cursor-pointer"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No residents found matching your search.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Pending Join Requests List */
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow border dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="font-semibold text-gray-700 dark:text-gray-200">Pending Requests ({filteredPending.length})</h2>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {approvalsLoading ? (
                            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>
                        ) : filteredPending.length > 0 ? (
                            filteredPending.map(approval => {
                                const requester = approval.requesterId;
                                if (!requester) return null;
                                return (
                                    <div key={approval._id} className="p-4 flex items-center justify-between hover:bg-gray-55 dark:hover:bg-gray-700/50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-200">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={requester.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(requester.name)}`}
                                                alt={requester.name}
                                                className="w-10 h-10 rounded-full bg-gray-200"
                                            />
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">{requester.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{requester.email}</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {requester.phoneNumber && (
                                                        <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Phone size={10} /> {requester.phoneNumber}
                                                        </span>
                                                    )}
                                                    {requester.profile?.houseNo && (
                                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                                                            House No: {requester.profile.houseNo}
                                                        </span>
                                                    )}
                                                    <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                                                        Requested: {new Date(approval.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                disabled={decisionLoadingId !== null}
                                                onClick={() => handleDecision(approval._id, 'APPROVED')}
                                                className="p-1.5 text-sm bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 dark:bg-green-950/20 dark:hover:bg-green-950/40 rounded-lg transition-colors border border-green-200 dark:border-green-800 flex items-center gap-1 cursor-pointer font-medium"
                                            >
                                                {decisionLoadingId === approval._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                Approve
                                            </button>
                                            <button
                                                disabled={decisionLoadingId !== null}
                                                onClick={() => handleDecision(approval._id, 'REJECTED')}
                                                className="p-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 dark:bg-red-950/20 dark:hover:bg-red-955/40 rounded-lg transition-colors border border-red-200 dark:border-red-800 flex items-center gap-1 cursor-pointer font-medium"
                                            >
                                                {decisionLoadingId === approval._id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No pending join requests.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border-t-4 border-red-500 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <AlertTriangle size={28} />
                            <h2 className="text-xl font-bold">Transfer Presidency?</h2>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Are you sure you want to transfer the role of <strong>President</strong> to this resident?
                        </p>

                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-900/50 mb-6">
                            <ul className="text-sm text-red-800 dark:text-red-200 space-y-2 list-disc list-inside">
                                <li>You will immediately become a <strong>Resident</strong>.</li>
                                <li>You will lose all admin privileges (managing issues, announcements, etc).</li>
                                <li>This action <strong>cannot be undone</strong> by you.</li>
                            </ul>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(null)}
                                disabled={transferring}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleTransfer(showConfirm)}
                                disabled={transferring}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-500/30 transition-all font-bold flex items-center gap-2 cursor-pointer"
                            >
                                {transferring ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />}
                                Confirm Transfer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCommunity;
