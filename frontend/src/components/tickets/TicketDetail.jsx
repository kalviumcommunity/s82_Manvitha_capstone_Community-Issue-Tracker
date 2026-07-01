import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { ArrowLeft, Clock, MapPin, User, AlertTriangle, CheckCircle, MessageSquare, Send } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import CommentThread from './CommentThread';

const statusConfig = {
    OPEN: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Open' },
    IN_PROGRESS: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'In Progress' },
    RESOLVED: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Resolved' },
    CLOSED: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Closed' },
};

const priorityConfig = {
    LOW: { color: 'text-gray-500', label: 'Low' },
    MEDIUM: { color: 'text-blue-500', label: 'Medium' },
    HIGH: { color: 'text-orange-500', label: 'High' },
    CRITICAL: { color: 'text-red-500', label: 'Critical' },
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
                note: `Status updated to ${newStatus} by ${user.name}`
            });
            setTicket(res.data); // Update local state with new ticket data
        } catch (err) {
            console.error("Error updating status:", err);
            addNotification({ title: 'Error', message: 'Failed to update status', type: 'error' });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl text-red-500 mb-4">{error || "Ticket not found"}</h2>
                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-600 hover:underline flex items-center justify-center gap-2 mx-auto"
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
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
            {/* Header / Nav */}
            <button
                onClick={() => navigate(-1)}
                className="mb-6 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Dashboard
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Ticket Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${status.color}`}>
                                    {status.label}
                                </span>
                                {ticket.priority && ticket.priority.toUpperCase() !== 'LOW' && (
                                    <span className={`flex items-center text-sm font-medium ${priority.color}`}>
                                        <AlertTriangle size={14} className="mr-1" />
                                        {priority.label} Priority
                                    </span>
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    #{ticket._id.slice(-6).toUpperCase()}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {ticket.title}
                            </h1>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4">
                                <span className="flex items-center">
                                    <User size={14} className="mr-1" />
                                    Created by Residents
                                </span>
                                <span className="flex items-center">
                                    <Clock size={14} className="mr-1" />
                                    {format(new Date(ticket.createdAt), 'PPP p')}
                                </span>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        {isPresident && (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Update Status
                                </label>
                                <select
                                    value={ticket.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    disabled={updating}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {Object.keys(statusConfig).map(s => (
                                        <option key={s} value={s}>{statusConfig[s].label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ticket Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </div>

                        {/* Photos */}
                        {ticket.photos && ticket.photos.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Attached Photos</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {ticket.photos.map((photo, index) => (
                                        <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
                                            <img
                                                src={photo}
                                                alt={`Attachment ${index + 1}`}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                                                onClick={() => window.open(photo, '_blank')}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <MessageSquare size={20} className="mr-2" />
                                Comments & Updates
                            </h3>
                            <CommentThread ticketId={ticket._id} />
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Details</h4>
                            <dl className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white capitalize">{ticket.category}</dd>
                                </div>
                                {ticket.unit && (
                                    <div className="flex justify-between">
                                        <dt className="text-gray-500 dark:text-gray-400">Unit / Location</dt>
                                        <dd className="font-medium text-gray-900 dark:text-white">{ticket.unit}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <dt className="text-gray-500 dark:text-gray-400">Last Updated</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">
                                        {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {ticket.history && ticket.history.length > 0 && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">History</h4>
                                <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-600">
                                    {ticket.history.slice().reverse().slice(0, 5).map((h, i) => (
                                        <div key={i} className="relative pl-6 text-xs">
                                            <div className="absolute left-1 top-1 w-2.5 h-2.5 rounded-full bg-blue-400 border-2 border-white dark:border-gray-800"></div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {h.action ? h.action.replace('_', ' ') : 'Update'}
                                            </p>
                                            <p className="text-gray-500 dark:text-gray-400">
                                                {format(new Date(h.at), 'MMM d, h:mm a')}
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
