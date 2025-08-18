import React from "react";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import Feed from "./pages/Feed";
import { Route, Routes, useLocation } from "react-router-dom";
import ChatBox from "./pages/ChatBox";
import Connections from "./pages/Connections";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import { useUser } from "@clerk/clerk-react";
import Layout from "./pages/Layout";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "./features/user/userSlice";
import { fetchConnections } from "./features/connections/connectionsSlice";
import { useRef } from "react";
import { addMessage } from "./features/messages/messagesSlice";
import Notification from "./components/Notification";
import PostPage from "./pages/PostPage";

const App = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
      }
    };
    fetchData();
  }, [user, getToken, dispatch]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (user) {
      const endpoint = import.meta.env.VITE_BASEURL + "/api/message/" + user.id;
      const eventSource = new EventSource(endpoint);

      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (pathnameRef.current === "/messages/" + message.from_user_id._id) {
          dispatch(addMessage(message));
        } else {
          toast.custom((t) => <Notification t={t} message={message} />, {
            position: "bottom-right",
          });
        }
      };

      // 🔹 Handle "seen" events
      eventSource.addEventListener("seen", (event) => {
        const data = JSON.parse(event.data);

        // Here you should update Redux so all messages sent *to* this user are marked seen
        // Example: dispatch a new reducer (markMessagesSeen) to update store
        dispatch({ type: "messages/markSeen", payload: data.to_user_id });
      });

      return () => {
        eventSource.close();
      };
    }
  }, [user, dispatch]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="post/:postId" element={<PostPage />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
