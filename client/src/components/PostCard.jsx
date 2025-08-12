import { BadgeCheck, Heart, MessageCircle, Share2, Trash2 } from 'lucide-react'; // ⬅ Added Trash2 icon
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
  const formattedContent = (post.content || '').replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');

  const [likes, setLikes] = useState(post.likes_count || []);
  const [replies, setReplies] = useState([]);
  const [replyCount, setReplyCount] = useState(post.total_replies || 0); // ⬅ NEW state
  const [page, setPage] = useState(1);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [replyText, setReplyText] = useState('');

  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadReplies(1);
  }, []);

  /** Fetch replies */
  const loadReplies = async (pageNum) => {
    try {
      const { data } = await api.get(`/api/reply/post/${post._id}?page=${pageNum}&limit=5`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setReplies((prev) => (pageNum === 1 ? data.replies : [...prev, ...data.replies]));
        setHasMoreReplies(data.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  /** Like post */
  const handleLike = async () => {
    try {
      const { data } = await api.post(
        `/api/post/like`,
        { postId: post._id },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (data.success) {
        setLikes((prev) =>
          prev.includes(currentUser._id)
            ? prev.filter((id) => id !== currentUser._id)
            : [...prev, currentUser._id]
        );
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleShare = async (postId) => {
  const postUrl = `${window.location.origin}/post/${postId}`;

  if (navigator.share) {
    await navigator.share({
      title: "Check out this post!",
      url: postUrl
    });
  } else {
    await navigator.clipboard.writeText(postUrl);
    toast.success("Post link copied!");
  }
};


  /** Add reply */
  const handleAddReply = async () => {
    if (!replyText.trim()) return;
    try {
      const { data } = await api.post(
        '/api/reply/add',
        { postId: post._id, text: replyText },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setReplies((prev) => [data.reply, ...prev]);
        setReplyText('');
        setReplyCount((prev) => prev + 1); // ⬅ Increment count
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  /** Delete reply */
  const handleDeleteReply = async (replyId) => {
    if (!window.confirm("Are you sure you want to delete this reply?")) return;
    try {
      const { data } = await api.delete(`/api/reply/${replyId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setReplies((prev) => prev.filter((r) => r._id !== replyId));
        setReplyCount((prev) => Math.max(0, prev - 1)); // ⬅ Decrement count safely
        toast.success("Reply deleted");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  /** Render single reply */
  const renderReply = (reply) => (
    <div key={reply._id} className="flex items-start gap-2 mt-2">
      <img src={reply.replier_id.profile_picture} className="w-6 h-6 rounded-full" alt="" />
      <div className="flex-1">
        <span className="font-semibold">{reply.replier_id.full_name}</span> {reply.text}
      </div>
      {reply.replier_id._id === currentUser._id && (
        <Trash2
          onClick={() => handleDeleteReply(reply._id)}
          className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-700"
        />
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">
      {/* User Info */}
      <div
        onClick={() => navigate(`/profile/${post.user._id}`)}
        className="inline-flex items-center gap-3 cursor-pointer"
      >
        <img src={post.user.profile_picture} className="w-10 h-10 rounded-full shadow" alt="" />
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user.full_name}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} • {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div
          className="text-gray-800 text-sm whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      )}

      {/* Images */}
      {post.image_urls?.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {post.image_urls.map((img, idx) => (
            <img
              key={idx}
              src={img}
              className={`w-full object-cover rounded-lg ${
                post.image_urls.length === 1 ? 'col-span-2 h-auto' : 'h-48'
              }`}
              alt=""
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
        <div className="flex items-center gap-1">
          <Heart
            onClick={handleLike}
            className={`w-4 h-4 cursor-pointer ${
              likes.includes(currentUser._id) && 'text-red-500 fill-red-500'
            }`}
          />
          <span>{likes.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{replyCount}</span> {/* ⬅ Now uses state */}
        </div>
        <div className="flex items-center gap-1">
          <Share2 className="w-4 h-4 cursor-pointer" onClick={() => handleShare(post._id)} />
        </div>
      </div>

      {/* Replies */}
      {replies.map(renderReply)}

      {hasMoreReplies && (
        <button
          className="text-xs text-blue-500"
          onClick={() => loadReplies(page + 1)}
        >
          Load more replies
        </button>
      )}

      {/* Main reply input */}
      <div className="flex gap-2 pt-2 border-t border-gray-200">
        <input
          type="text"
          placeholder="Write a reply..."
          className="flex-1 text-sm border rounded px-2 py-1"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
        />
        <button onClick={handleAddReply} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
          Reply
        </button>
      </div>
    </div>
  );
};


export default PostCard;
