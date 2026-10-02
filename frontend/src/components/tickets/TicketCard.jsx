import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, User, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const statusConfig = {
  OPEN: { color: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30', label: 'Open' },
  IN_PROGRESS: { color: 'bg-[#B87333]/15 text-[#8B4513] dark:text-[#E5A96A] border border-[#B87333]/30', label: 'In Progress' },
  RESOLVED: { color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30', label: 'Resolved' },
  CLOSED: { color: 'bg-gray-100 dark:bg-[#1E1E1E] text-gray-600 dark:text-[#888888] border border-gray-200 dark:border-[#2E2E2E]', label: 'Closed' },
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

  const status = statusConfig[ticket.status?.toUpperCase().replace('-', '_')] || statusConfig.OPEN;
  const ticketLink = `/tickets/${ticket._id}`;
  const comments = ticket.comments || [];
  const title = ticket.title || 'Untitled Ticket';
  const description = ticket.description || '';
  const category = categoryEmoji[ticket.category] || '📝';

  const isPresident = user && user.role && user.role.toUpperCase() === 'PRESIDENT';
  const isCreator = user && ticket.createdBy && String(user._id || user.id) === String(ticket.createdBy._id || ticket.createdBy);
  const isResolvedOrClosed = ['RESOLVED', 'CLOSED'].includes(ticket.status?.toUpperCase());
  const canEdit = isPresident || (isCreator && !isResolvedOrClosed);
  const canDelete = isPresident || (isCreator && !isResolvedOrClosed);

  return (
    <div className="relative group">
      {/* Main content */}
      <Link
        to={ticketLink}
        className="block border border-[#E5E0D8] dark:border-[#222222] hover:border-[#B87333]/60 rounded-2xl transition-all duration-200 bg-white/80 dark:bg-[#121212]/90 backdrop-blur-md overflow-hidden"
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center min-w-0">
              <span className="text-base mr-2 shrink-0" aria-hidden="true">{category}</span>
              <h3 className="text-sm sm:text-base font-semibold text-[#1A1A1A] dark:text-[#F5F2ED] truncate">
                {compact && title.length > 40 ? title.substring(0, 40) + '...' : title}
              </h3>
            </div>
            {/* Status badge */}
            <span className={`text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full transition-opacity duration-200 shrink-0 ${(canEdit || canDelete) ? 'group-hover:opacity-0' : ''} ${status.color}`}>
              {status.label}
            </span>
          </div>

          {!compact && (
            <p className="mt-2.5 text-xs text-[#666666] dark:text-[#888888] line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}

          <div className="mt-3.5 flex items-center justify-between text-[11px] text-[#777777] dark:text-[#737373] border-t border-[#EAE5DD] dark:border-[#1C1C1C] pt-2.5">
            <div className="flex items-center gap-3">
              {ticket.assignedTo && (
                <div className="flex items-center text-[#B87333]">
                  <User size={12} className="mr-1" />
                  <span>Assigned</span>
                </div>
              )}
              {!compact && comments.length > 0 && (
                <div className="flex items-center">
                  <CheckCircle size={12} className="mr-1 text-emerald-500" />
                  <span>
                    {comments.length} comment{comments.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            <div>
              {ticket.createdAt && formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </Link>

      {/* Edit / Delete buttons with copper border */}
      {(canEdit || canDelete) && (
        <div className="absolute top-3.5 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {canEdit && onEdit && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(ticket);
              }}
              className="p-1.5 bg-white/90 dark:bg-[#1E1E1E]/90 hover:bg-[#F0EBE4] dark:hover:bg-[#2A2A2A] border border-[#B87333]/50 hover:border-[#B87333] rounded-lg text-[#555555] dark:text-[#A0A0A0] hover:text-[#B87333] transition-colors cursor-pointer backdrop-blur-md"
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
              className="p-1.5 bg-white/90 dark:bg-[#1E1E1E]/90 hover:bg-rose-50 dark:hover:bg-rose-500/20 border border-rose-300 dark:border-[#333333] hover:border-rose-500 rounded-lg text-[#666666] dark:text-[#A0A0A0] hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer backdrop-blur-md"
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
