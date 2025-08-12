import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import UserCard from "../components/UserCard";
import Loading from "../components/Loading";
import SearchInput from "../components/SearchInput";
import api from "../api/axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchUser } from "../features/user/userSlice";

const Discover = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  const fetchUsers = async (pageNumber, searchTerm = "") => {
    try {
      setLoading(true);
      const token = await getToken();

      let data;
      if (searchTerm) {
        // Search mode
        const res = await api.post(
          `/api/user/discover?page=${pageNumber}&limit=10`,
          { input: searchTerm },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data = res.data;
      } else {
        // Normal mode
        const res = await api.get(`/api/user/all?page=${pageNumber}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = res.data;
      }

      if (data.success) {
        setUsers((prev) => (pageNumber === 1 ? data.users : [...prev, ...data.users]));
        setHasMore(data.hasMore);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Search handler
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setSearchMode(input.trim() !== "");
      setUsers([]);
      setPage(1);
      fetchUsers(1, input.trim());
    }
  };

  // Infinite scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);


  useEffect(() => {
    if (page > 1) {
      fetchUsers(page, searchMode ? input.trim() : "");
    }
  }, [page]);


  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchUser(token));
    });
    fetchUsers(1);
  }, []);

  return (
    <div className="h-full width-layout overflow-y-scroll no-scrollbar min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Discover People</h1>
          <p className="text-slate-600">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
          <SearchInput setInput={setInput} input={input} handleSearch={handleSearch} />
        </div>

        {/* Users */}
        <div className="flex justify-center flex-wrap gap-6 px-6">
          {users.map((user) => (
            <UserCard user={user} key={user._id} />
          ))}
        </div>

        {loading && <Loading height="20vh" />}
        {!hasMore && users.length > 0 && (
          <p className="text-center py-4 text-slate-500">No more users</p>
        )}
      </div>
    </div>
  );
};

export default Discover;
