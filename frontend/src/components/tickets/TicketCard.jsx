import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

const statusConfig = {
  open: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Open' },
  'in-progress': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'In Progress' },
  resolved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Resolved' },
  closed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Closed' },
};

const categoryEmoji = {
  maintenance: '🔧',
  security: '🔒',
  noise: '🔊',
  cleanliness: '🧹',
  amenities: '🏋️',
  payments: '💰',
  other: '📝',
};

const TicketCard = ({ ticket, compact = false, onEdit, onDelete }) => {
  const [user, setUser] = useState(null);

  // Fetch current user using secure cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:3551/api/auth/me', {
          withCredentials: true, // send HttpOnly cookie
        });
        setUser(res.data);
      } catch (err) {
        console.warn('User not logged in or cookie invalid');
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  if (!ticket) return null;

  const status = statusConfig[ticket.status] || statusConfig.open;
  const ticketLink = `/tickets/${ticket._id}`;
  const comments = ticket.comments || [];
  const title = ticket.title || 'Untitled Ticket';
  const description = ticket.description || '';
  const category = categoryEmoji[ticket.category] || '📝';
  const unit = ticket.unit || 'Unit not specified';

  // Allow edit/delete only for admins or ticket owners
  const canEdit = user && (user.role === 'president' || user._id === ticket.createdBy);
  const canDelete = user && user.role === 'president';

  return (
    <div className="relative group">
      {/* Main content */}
      <Link
        to={ticketLink}
        className="block border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <span className="text-lg mr-2" aria-hidden="true">{category}</span>
              <h3 className="text-md font-medium text-gray-900 dark:text-white">
                {compact && title.length > 40 ? title.substring(0, 40) + '...' : title}
              </h3>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>{status.label}</span>
          </div>

          {!compact && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">{unit}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
            </div>
          </div>

          {ticket.assignedTo && (
            <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <User size={14} className="mr-1" />
              <span>Assigned</span>
            </div>
          )}

          {!compact && comments.length > 0 && (
            <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-400">
              <CheckCircle size={14} className="mr-1" />
              <span>
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Edit / Delete buttons (only for allowed users) */}
      {(canEdit || canDelete) && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(ticket);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(ticket._id);
              }}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketCard;
