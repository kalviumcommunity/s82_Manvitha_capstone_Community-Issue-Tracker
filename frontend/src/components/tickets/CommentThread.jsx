import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

const CommentThread = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim() && user) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  if (!comments.length && !user) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Comments</h3>
      </div>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="p-4 space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}`}
                alt={comment.userName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{comment.userName}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      comment.userRole === 'president' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                        : comment.userRole === 'vice-president' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {comment.userRole.replace('-', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                  {comment.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No comments yet.
        </div>
      )}

      {/* Comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute bottom-2 right-2 p-1.5 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentThread;
