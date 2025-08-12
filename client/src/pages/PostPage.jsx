import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";

const PostPage = () => {
  const { postId } = useParams();
  const { getToken } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/api/post/${postId}`, {
          headers: { Authorization: `Bearer ${await getToken()}` },
        });
        if (data.success) {
          setPost(data.post);
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, getToken]);

  if (loading) return <p className="text-center py-6">Loading...</p>;
  if (!post) return <p className="text-center py-6">Post not found</p>;

  return (
    <div className="flex justify-center py-6">
      <PostCard post={post} />
    </div>
  );
};

export default PostPage;
