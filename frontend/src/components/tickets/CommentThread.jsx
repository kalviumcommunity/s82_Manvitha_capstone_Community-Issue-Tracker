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
        console.error('Error fetching comments:', error);
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

  if (loading) return <div className="p-4 text-center text-xs text-[#737373]">Loading comments...</div>;

  return (
    <div className="bg-[#121212]/90 rounded-2xl border border-[#222222] overflow-hidden backdrop-blur-md">
      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="p-4 sm:p-5 space-y-4">
          {comments.map((comment) => {
            const author = comment.authorId || {};
            const userName = author.name || 'Unknown User';
            const userRole = author.role || 'RESIDENT';
            const roleLabel = userRole === 'PRESIDENT' ? 'Admin' : 'User';

            return (
              <div key={comment._id || comment.id} className="flex gap-3">
                <img
                  src={
                    author.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=222222&color=F5F2ED`
                  }
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#2E2E2E]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs sm:text-sm text-[#F5F2ED]">
                        {userName}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          userRole === 'PRESIDENT'
                            ? 'bg-[#B87333]/15 text-[#E5A96A] border border-[#B87333]/30'
                            : 'bg-[#1E1E1E] text-[#A0A0A0] border border-[#2E2E2E]'
                        }`}
                      >
                        {roleLabel}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#737373]">
                      {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-[#A0A0A0] whitespace-pre-wrap leading-relaxed">
                    {comment.body || comment.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-[#737373]">
          No comments yet. Be the first to share an update!
        </div>
      )}

      {/* Comment form with glassy button */}
      {user && (
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-[#222222] bg-[#171717]/40">
          <div className="flex gap-3">
            <img
              src={
                user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=222222&color=F5F2ED`
              }
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#2E2E2E]"
            />
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment or update..."
                className="w-full border border-[#262626] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F2ED] bg-[#141414] focus:outline-none focus:border-[#B87333]/60 resize-none pr-12"
                rows={2}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="absolute bottom-3 right-3 p-2 rounded-lg bg-[#B87333]/25 hover:bg-[#B87333]/35 text-[#F5F2ED] border border-[#B87333]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                title="Post Comment"
              >
                <Send size={14} className="text-[#E5A96A]" />
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CommentThread;
