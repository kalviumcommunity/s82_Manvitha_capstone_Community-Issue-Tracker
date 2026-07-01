import React, { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useNotifications } from '../../contexts/NotificationContext';

const CommentThread = ({ ticketId }) => {
  const { addNotification } = useNotifications();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user & comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, commentsRes] = await Promise.all([
          axios.get('https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1/auth/me', { withCredentials: true }),
          axios.get(`https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1/issues/${ticketId}/comments`, { withCredentials: true })
        ]);
        setUser(userRes.data);
        setComments(commentsRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Still allow viewing if user fetch fails (though unlikely with auth guard)
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) fetchData();
  }, [ticketId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const res = await axios.post(
        `https://s82-manvitha-capstone-community-issue-ojxt.onrender.com/api/v1/issues/${ticketId}/comment`,
        { body: newComment },
        { withCredentials: true }
      );

      const createdComment = res.data;

      // Manually construct display object since the post response might not be populated
      const displayComment = {
        _id: createdComment._id,
        body: createdComment.body,
        createdAt: createdComment.createdAt,
        authorId: {
          _id: user.id || user._id,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      };

      setComments([...comments, displayComment]);
      setNewComment('');
    } catch (err) {
      console.error("Failed to post comment", err);
      addNotification({ title: 'Error', message: 'Failed to post comment', type: 'error' });
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Loading comments...</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="p-4 space-y-4">
          {comments.map((comment) => {
            const author = comment.authorId || {};
            const userName = author.name || 'Unknown User';
            const userRole = author.role || 'RESIDENT';

            return (
              <div key={comment._id || comment.id} className="flex gap-3">
                <img
                  src={
                    author.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}`
                  }
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {userName}
                      </span>
                      {userRole && (
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded-full ${userRole === 'PRESIDENT'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                          {userRole === 'PRESIDENT' ? 'President' : 'Resident'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                    {comment.body || comment.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">No comments yet. Be the first to verify or add info!</div>
      )}

      {/* Comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <img
              src={
                user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
              }
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
