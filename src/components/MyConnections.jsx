import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import {
  FiUserCheck,
  FiMail,
  FiBriefcase,
  FiArrowLeft,
  FiMessageCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import ChatRoom from "../components/ChatRoom";
import { motion } from "framer-motion";
const MyConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [directChatMapping, setDirectChatMapping] = useState({});

  const loggedInUser = useSelector((state) => state.user);
  const loggedInUserId = loggedInUser?._id;

  // Fetch unread counts (keys: chat IDs)
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/chat/unread-count`, {
          withCredentials: true,
        });
        setUnreadCounts(res.data.data);
      } catch (err) {
        console.error("Failed to fetch unread counts:", err);
      }
    };
    if (loggedInUserId) fetchUnreadCounts();
  }, [loggedInUserId]);

  // Fetch accepted connections
  useEffect(() => {
    const fetchConnections = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/people/connections`, {
          withCredentials: true,
        });
        setConnections(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch connections.");
      } finally {
        setLoading(false);
      }
    };
    if (loggedInUserId) fetchConnections();
  }, [loggedInUserId]);

  // Fetch direct chat IDs for each connection and build mapping: { connectionUserId: directChatId }
  useEffect(() => {
    const fetchDirectChats = async () => {
      const mapping = {};
      await Promise.all(
        connections.map(async (conn) => {
          if (conn._id === loggedInUserId) return;
          try {
            const res = await axios.post(
              `${BASE_URL}/api/chat/direct`,
              { userId: conn._id },
              { withCredentials: true }
            );
            mapping[conn._id] = res.data.data._id;
          } catch (err) {
            console.error("Failed to fetch direct chat for", conn._id, err);
          }
        })
      );
      setDirectChatMapping(mapping);
    };
    if (connections.length > 0) fetchDirectChats();
  }, [connections, loggedInUserId]);

  // Handle Chat Icon Click using the mapping
  const handleChatClick = async (user) => {
    const directId = directChatMapping[user._id];
    if (!directId) {
      console.error("Direct chat id not available for user", user);
      return;
    }
    setChatId(directId);
    setSelectedUser(user);
    setIsChatOpen(true);

    try {
      await axios.patch(
        `${BASE_URL}/api/chat/${directId}/read`,
        {},
        { withCredentials: true }
      );
      // Remove unread count for this direct chat
      setUnreadCounts((prev) => ({ ...prev, [directId]: 0 }));
    } catch (err) {
      console.error("Failed to mark messages as read for chat", directId, err);
    }
  };

  if (loading)
    return <div className="text-center text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (connections.length === 0)
    return (
      <div className="min-h-screen text-center bg-[#8F8AC3] text-gray-400">
        No connections found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#8F8AC3] text-white p-10">
    {/* Header with Back Link */}
    <div className="mb-6">
      <Link to="/feed" className="text-white inline-flex items-center hover:underline">
        <FiArrowLeft className="mr-2" /> Back to Project Feed
      </Link>
    </div>
    <h2 className="text-4xl font-bold mb-8 text-center">My Connections</h2>
  
    {/* Grid Layout: 3 cards per row */}
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {connections.map((user) => (
        <motion.div
          key={user._id}
          className="p-6 bg-white text-[#4B4896] rounded-xl shadow-lg hover:shadow-2xl transition-all border border-gray-200 relative"
          whileHover={{ scale: 1.02 }}
        >
          {/* Chat Icon at Top Right */}
          <button
            onClick={() => handleChatClick(user)}
            className="absolute top-3 right-3 bg-purple-600 p-2 rounded-full hover:bg-purple-500 transition"
            title="Chat"
          >
            <FiMessageCircle size={18} className="text-white" />
          </button>
  
          {/* Notification Badge */}
          {directChatMapping[user._id] &&
            unreadCounts[directChatMapping[user._id]] > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-xs text-white px-2 py-0.5 rounded-full">
                {unreadCounts[directChatMapping[user._id]]}
              </span>
            )}
  
          {/* Profile Info */}
          <div className="flex items-center mb-4">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt="Profile"
                className="w-14 h-14 rounded-full object-cover border border-gray-300 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-[#4B4896]">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
            )}
            <div className="ml-3">
              <h3 className="text-lg font-bold">{user.firstName} {user.lastName}</h3>
              <p className="text-sm text-gray-500">
                <FiMail className="mr-1 inline" /> {user.emailId}
              </p>
            </div>
          </div>
  
          {/* About & Connection Date */}
          <p className="text-sm text-gray-600 mt-2 flex items-center">
            <FiBriefcase className="mr-1" /> {user.about || "No information available"}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Connected Since: {dayjs(user.createdAt).format("DD MMM YYYY")}
          </p>
        </motion.div>
      ))}
    </motion.div>
  
    {/* Chat Modal */}
    {isChatOpen && chatId && selectedUser && (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="p-6 w-11/12 max-w-4xl relative">
          <ChatRoom
            chatId={chatId}
            userId={loggedInUserId}
            receiverId={selectedUser._id}
            receiverName={`${selectedUser.firstName} ${selectedUser.lastName}`}
            receiverPhoto={selectedUser.photoUrl}
            onClose={() => setIsChatOpen(false)}
          />
        </div>
      </div>
    )}
  </div>
  
  );
};

export default MyConnections;
