import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, User, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const statusConfig = {
  OPEN: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Open' },
  IN_PROGRESS: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'In Progress' },
  RESOLVED: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Resolved' },
  CLOSED: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Closed' },
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
  const { user } = useAuth();

  if (!ticket) return null;

  const status = statusConfig[ticket.status.toUpperCase().replace('-', '_')] || statusConfig.OPEN;
  const ticketLink = `/tickets/${ticket._id}`;
  const comments = ticket.comments || [];
  const title = ticket.title || 'Untitled Ticket';
  const description = ticket.description || '';
  const category = categoryEmoji[ticket.category] || '📝';

  // Allow edit/delete only for admins or ticket owners (case-insensitive checks)
  const isPresident = user && user.role && user.role.toUpperCase() === 'PRESIDENT';
  const isCreator = user && ticket.createdBy && String(user._id || user.id) === String(ticket.createdBy._id || ticket.createdBy);
  const isResolvedOrClosed = ['RESOLVED', 'CLOSED'].includes(ticket.status.toUpperCase());
  const canEdit = isPresident || (isCreator && !isResolvedOrClosed);
  const canDelete = isPresident || (isCreator && !isResolvedOrClosed);

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
            {/* The status badge fades out on hover to make space for the actions */}
            <span className={`text-xs px-2 py-1 rounded-full transition-opacity duration-200 ${(canEdit || canDelete) ? 'group-hover:opacity-0' : ''} ${status.color}`}>
              {status.label}
            </span>
          </div>

          {!compact && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-end">
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

      {/* Edit / Delete buttons (fades in where the status badge was, avoiding clutter) */}
      {(canEdit || canDelete) && (
        <div className="absolute top-3.5 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {canEdit && onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(ticket);
              }}
              className="p-1 bg-gray-50 dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors cursor-pointer"
              title="Edit Ticket"
            >
              <Edit2 size={13} />
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(ticket._id);
              }}
              className="p-1 bg-gray-50 dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 hover:text-red-700 transition-colors cursor-pointer"
              title="Delete Ticket"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketCard;
