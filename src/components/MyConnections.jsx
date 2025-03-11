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
  if (error)
    return <div className="text-center text-red-500">{error}</div>;
  if (connections.length === 0)
    return <div className="min-h-screen text-center text-gray-400">No connections found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header with Back Link */}
      <div className="mb-6">
        <Link to="/" className="text-blue-400 inline-flex items-center">
          <FiArrowLeft className="mr-1" /> Back to Project Feed
        </Link>
      </div>
      <h2 className="text-3xl font-bold mb-4 text-blue-400 text-center">
        My Connections
      </h2>

      {/* Grid Layout: 1 col on small, 2 on md, 3 on lg */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connections.map((user) => (
          <div
            key={user._id}
            className="p-4 bg-gray-800 rounded-lg shadow-lg relative"
          >
            <div className="absolute top-2 right-2 bg-green-600 text-xs text-white px-2 py-1 rounded-full">
              <FiUserCheck className="inline-block mr-1" /> Connected
            </div>
            <div className="flex items-center mb-4">
              <img
                src={user.photoUrl || "https://via.placeholder.com/50"}
                alt="Profile"
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <h3 className="text-xl font-bold text-yellow-400">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-400 flex items-center">
                  <FiMail className="mr-1" /> {user.emailId}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-2 flex items-center">
              <FiBriefcase className="mr-1" /> {user.about || "No information available"}
            </p>
            <p className="text-sm text-gray-400 mb-2">
              Connected Since: {dayjs(user.createdAt).format("DD MMM YYYY")}
            </p>
            <div className="flex justify-end items-center">
              <button
                onClick={() => handleChatClick(user)}
                className="p-2 bg-purple-600 rounded-full hover:bg-purple-500 transition"
                title="Chat"
              >
                <FiMessageCircle size={16} />
              </button>
              {directChatMapping[user._id] &&
                unreadCounts[directChatMapping[user._id]] > 0 && (
                  <span className="ml-2 bg-red-600 text-xs text-white px-2 py-0.5 rounded-full">
                    {unreadCounts[directChatMapping[user._id]]}
                  </span>
                )}
            </div>
          </div>
        ))}
      </div>

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
