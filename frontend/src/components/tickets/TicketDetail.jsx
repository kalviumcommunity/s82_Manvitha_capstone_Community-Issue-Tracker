import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { ArrowLeft, Clock, MapPin, User, AlertTriangle, CheckCircle, MessageSquare, Send } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import CommentThread from './CommentThread';

const statusConfig = {
    OPEN: { color: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30', label: 'Open' },
    IN_PROGRESS: { color: 'bg-[#B87333]/15 text-[#8B4513] dark:text-[#E5A96A] border border-[#B87333]/30', label: 'In Progress' },
    RESOLVED: { color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30', label: 'Resolved' },
    CLOSED: { color: 'bg-gray-100 dark:bg-[#1E1E1E] text-gray-600 dark:text-[#888888] border border-gray-200 dark:border-[#2E2E2E]', label: 'Closed' },
};

const priorityConfig = {
    LOW: { color: 'text-[#777777] dark:text-[#737373]', label: 'Low' },
    MEDIUM: { color: 'text-sky-500 dark:text-sky-400', label: 'Medium' },
    HIGH: { color: 'text-amber-500 dark:text-amber-400', label: 'High' },
    CRITICAL: { color: 'text-rose-500 dark:text-rose-400', label: 'Critical' },
};

const api = axios.create({
    baseURL: 'http://localhost:3551/api/v1',
    withCredentials: true,
});

const TicketDetail = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addNotification } = useNotifications();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await api.get(`/issues/${ticketId}`);
                setTicket(res.data);
            } catch (err) {
                console.error("Error fetching ticket:", err);
                setError("Failed to load ticket details.");
            } finally {
                setLoading(false);
            }
        };

        if (ticketId) fetchTicket();
    }, [ticketId]);

    const handleStatusChange = async (newStatus) => {
        if (!ticket) return;
        setUpdating(true);
        try {
            const res = await api.post(`/issues/${ticketId}/status`, {
                status: newStatus,
                note: `Status updated to ${newStatus} by ${user?.name || 'Admin'}`
            });
            setTicket(res.data);
        } catch (err) {
            console.error("Error updating status:", err);
            addNotification({ title: 'Error', message: 'Failed to update status', type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#B87333]"></div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="p-8 text-center max-w-md mx-auto mt-10 bg-white/90 dark:bg-[#121212] border border-[#E5E0D8] dark:border-[#262626] rounded-2xl">
                <h2 className="text-lg text-rose-500 mb-4">{error || "Ticket not found"}</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-[#141414]/80 border border-[#B87333]/60 hover:border-[#B87333] text-[#B87333] hover:text-[#C98545] text-sm cursor-pointer"
                >
                    <ArrowLeft size={16} /> Go Back
                </button>
            </div>
        );
    }

    const status = statusConfig[ticket.status] || statusConfig.OPEN;
    const priority = priorityConfig[ticket.priority] || priorityConfig.LOW;
    const isPresident = user?.role === 'PRESIDENT';

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Back Navigation Button with Copper Border */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/70 dark:bg-[#141414]/80 hover:bg-[#F2EDE3] dark:hover:bg-[#1A1A1A] border border-[#B87333]/60 hover:border-[#B87333] text-xs font-semibold text-[#1A1A1A] dark:text-[#F5F2ED] transition-all cursor-pointer backdrop-blur-md"
                >
                    <ArrowLeft size={14} className="text-[#B87333]" />
                    <span>Back</span>
                </button>
            </div>

            <div className="bg-white/95 dark:bg-[#121212]/95 rounded-3xl border border-[#E5E0D8] dark:border-[#222222] overflow-hidden backdrop-blur-xl">
                {/* Ticket Header */}
                <div className="p-5 sm:p-6 border-b border-[#E5E0D8] dark:border-[#222222]">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${status.color}`}>
                                    {status.label}
                                </span>
                                {ticket.priority && ticket.priority.toUpperCase() !== 'LOW' && (
                                    <span className={`flex items-center text-xs font-medium ${priority.color}`}>
                                        <AlertTriangle size={13} className="mr-1" />
                                        {priority.label} Priority
                                    </span>
                                )}
                                <span className="text-xs text-[#888888] dark:text-[#737373]">
                                    #{ticket._id.slice(-6).toUpperCase()}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F2ED] mb-2 font-serif">
                                {ticket.title}
                            </h1>
                            <div className="flex items-center text-xs text-[#666666] dark:text-[#737373] gap-4 flex-wrap">
                                <span className="flex items-center">
                                    <User size={13} className="mr-1 text-[#B87333]" />
                                    Created by {ticket.createdBy?.name || 'Community Member'}
                                </span>
                                <span className="flex items-center">
                                    <Clock size={13} className="mr-1" />
                                    {ticket.createdAt ? format(new Date(ticket.createdAt), 'PPP p') : 'Recent'}
                                </span>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        {isPresident && (
                            <div className="flex flex-col gap-1.5 min-w-[200px]">
                                <label className="text-[11px] font-semibold text-[#777777] dark:text-[#737373] uppercase tracking-wider">
                                    Update Status
                                </label>
                                <select
                                    value={ticket.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={updating}
                                    className="w-full px-3 py-2 bg-[#FAF7F2] dark:bg-[#171717] border border-[#D5CEC2] dark:border-[#292929] rounded-xl text-xs sm:text-sm text-[#1A1A1A] dark:text-[#F5F2ED] focus:border-[#B87333] outline-none cursor-pointer"
                                >
                                    {Object.keys(statusConfig).map(s => (
                                        <option key={s} value={s} className="bg-white dark:bg-[#171717] text-[#1A1A1A] dark:text-[#F5F2ED]">{statusConfig[s].label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ticket Body */}
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-xs font-semibold text-[#777777] dark:text-[#737373] uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-xs sm:text-sm text-[#333333] dark:text-[#D4D4D4] leading-relaxed whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </div>

                        {/* Photos */}
                        {ticket.photos && ticket.photos.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold text-[#777777] dark:text-[#737373] uppercase tracking-wider mb-3">Attached Photos</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {ticket.photos.map((photo, index) => (
                                        <div key={index} className="aspect-square rounded-xl overflow-hidden border border-[#E5E0D8] dark:border-[#262626] bg-[#F2EDE3] dark:bg-[#141414]">
                                            <img
                                                src={photo.startsWith('/uploads') ? `http://localhost:3551${photo}` : photo}
                                                alt={`Attachment ${index + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                                onClick={() => window.open(photo.startsWith('/uploads') ? `http://localhost:3551${photo}` : photo, '_blank')}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="pt-5 border-t border-[#E5E0D8] dark:border-[#222222]">
                            <h3 className="text-base font-semibold text-[#1A1A1A] dark:text-[#F5F2ED] mb-3.5 flex items-center">
                                <MessageSquare size={18} className="mr-2 text-[#B87333]" />
                                Comments & Discussion
                            </h3>
                            <CommentThread ticketId={ticket._id} />
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-[#FAF7F2] dark:bg-[#171717]/60 rounded-2xl p-4 border border-[#E5E0D8] dark:border-[#222222]">
                            <h4 className="text-xs font-semibold text-[#777777] dark:text-[#737373] uppercase tracking-wider mb-3">Ticket Details</h4>
                            <dl className="space-y-2.5 text-xs">
                                <div className="flex justify-between">
                                    <dt className="text-[#777777] dark:text-[#737373]">Category</dt>
                                    <dd className="font-medium text-[#1A1A1A] dark:text-[#F5F2ED] capitalize">{ticket.category}</dd>
                                </div>
                                {ticket.unit && (
                                    <div className="flex justify-between">
                                        <dt className="text-[#777777] dark:text-[#737373]">Unit / Location</dt>
                                        <dd className="font-medium text-[#1A1A1A] dark:text-[#F5F2ED]">{ticket.unit}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt className="text-[#777777] dark:text-[#737373]">Last Updated</dt>
                                    <dd className="font-medium text-[#1A1A1A] dark:text-[#F5F2ED]">
                                        {ticket.updatedAt && formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {ticket.history && ticket.history.length > 0 && (
                            <div className="bg-[#FAF7F2] dark:bg-[#171717]/60 rounded-2xl p-4 border border-[#E5E0D8] dark:border-[#222222]">
                                <h4 className="text-xs font-semibold text-[#777777] dark:text-[#737373] uppercase tracking-wider mb-3">History</h4>
                                <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E0D8] dark:before:bg-[#262626]">
                                    {ticket.history.slice().reverse().slice(0, 5).map((h, i) => (
                                        <div key={i} className="relative pl-6 text-xs">
                                            <div className="absolute left-1 top-1 w-2.5 h-2.5 rounded-full bg-[#B87333] border-2 border-white dark:border-[#121212]"></div>
                                            <p className="font-medium text-[#1A1A1A] dark:text-[#F5F2ED]">
                                                {h.action ? h.action.replace('_', ' ') : 'Update'}
                                            </p>
                                            <p className="text-[11px] text-[#777777] dark:text-[#737373]">
                                                {h.at && format(new Date(h.at), 'MMM d, h:mm a')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetail;
