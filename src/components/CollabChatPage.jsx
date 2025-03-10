import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { FiArrowLeft, FiSend, FiPaperclip } from "react-icons/fi";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import ChatRoom from "./ChatRoom"; // Reusable direct chat component

const CollabChatPage = () => {
  const { projectId, chatId } = useParams();
  const navigate = useNavigate();
  const loggedInUser = useSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("group"); // "group" or "direct"
  const [collaborators, setCollaborators] = useState([]);

  // GROUP CHAT STATES
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupMessage, setNewGroupMessage] = useState("");
  const [groupLoading, setGroupLoading] = useState(true);
  const [actualGroupChatId, setActualGroupChatId] = useState(null);
  const groupMessagesEndRef = useRef(null);

  // DIRECT CHAT STATES
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
  const [directChatId, setDirectChatId] = useState(null);
  const [loadingDirect, setLoadingDirect] = useState(false);

  // Auto-scroll group chat messages
  const scrollGroupToBottom = () => {
    groupMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollGroupToBottom();
  }, [groupMessages]);

  // Fetch collaborators (used in both tabs)
  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/project/${projectId}/users`, {
          withCredentials: true,
        });
        setCollaborators(res.data.data);
      } catch (err) {
        console.error("Failed to fetch collaborators:", err);
      }
    };
    if (projectId) fetchCollaborators();
  }, [projectId]);

  // ---------- GROUP CHAT ----------
  // Fetch real group chat ID if chatId is "group"
  useEffect(() => {
    if (activeTab === "group") {
      const fetchGroupChatId = async () => {
        if (chatId === "group") {
          try {
            const res = await axios.post(
              `${BASE_URL}/api/chat/group-simple`,
              { projectId },
              { withCredentials: true }
            );
            setActualGroupChatId(res.data.data._id);
          } catch (err) {
            console.error("Failed to fetch group chat ID:", err);
          }
        } else {
          setActualGroupChatId(chatId);
        }
        setGroupLoading(false);
      };
      fetchGroupChatId();
    }
  }, [activeTab, chatId, projectId]);

  // Fetch group messages when actualGroupChatId is available
  useEffect(() => {
    if (activeTab === "group" && actualGroupChatId) {
      const fetchGroupMessages = async () => {
        try {
          const res = await axios.get(`${BASE_URL}/api/chat/${actualGroupChatId}/messages`, {
            withCredentials: true,
          });
          setGroupMessages(res.data.data);
        } catch (err) {
          console.error("Failed to fetch group messages:", err);
        }
      };
      fetchGroupMessages();
    }
  }, [activeTab, actualGroupChatId]);

  // Send a new group message
  const handleSendGroupMessage = async () => {
    if (!newGroupMessage.trim()) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/api/chat/${actualGroupChatId}/message`,
        { text: newGroupMessage },
        { withCredentials: true }
      );
      setGroupMessages((prev) => [...prev, res.data.data]);
      setNewGroupMessage("");
    } catch (err) {
      console.error("Failed to send group message:", err);
    }
  };

  // ---------- DIRECT CHAT ----------
  // Handle selection of a collaborator to start direct chat
  const handleSelectDirectCollaborator = async (receiverId) => {
    setSelectedReceiverId(receiverId);
    setLoadingDirect(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/chat/direct`,
        { userId: receiverId },
        { withCredentials: true }
      );
      setDirectChatId(res.data.data._id);
    } catch (err) {
      console.error("Failed to create or fetch direct chat:", err);
    }
    setLoadingDirect(false);
  };

  // ---------- HELPER FUNCTIONS ----------
  const getSenderName = (sender) => {
    // For group chat
    if (sender && typeof sender === "object" && sender.firstName) {
      return `${sender.firstName} ${sender.lastName}`;
    }
    const user = collaborators.find((u) => u._id === sender);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown";
  };

  // ---------- RENDER ----------
  return (
    <div className=" bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      {/* NAVIGATION BAR (Pinned at Top) */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow p-3 flex items-center">
        {/* Back Arrow */}
        <button onClick={() => navigate(-1)} className="text-gray-700 dark:text-gray-300 mr-4">
          <FiArrowLeft size={24} />
        </button>
        {/* Tabs (Left-Aligned) */}
        <div className="space-x-2">
          <button
            onClick={() => setActiveTab("group")}
            className={`px-4 py-2 rounded ${
              activeTab === "group" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Group Chat
          </button>
          <button
            onClick={() => setActiveTab("direct")}
            className={`px-4 py-2 rounded ${
              activeTab === "direct" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Direct Chat
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex justify-center mt-4">
        {/* GROUP CHAT VIEW */}
        {activeTab === "group" && (
          <div className="w-full max-w-4xl h-[70vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col overflow-hidden">
            {/* Optional Group Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <h2 className="text-lg font-semibold text-blue-500">Group Chat</h2>
            </div>
            {/* Collaborators Row */}
            <div className="flex px-4 py-2 space-x-4 overflow-x-auto bg-gray-50 dark:bg-gray-800">
              {collaborators.map((user) => (
                <div key={user._id} className="text-center">
                  <img
                    src={user.photoUrl || "/default-avatar.png"}
                    alt={user.firstName}
                    className="w-10 h-10 rounded-full border-2 border-blue-500"
                  />
                  <span className="block text-xs text-gray-600 dark:text-gray-300">
                    {user.firstName}
                  </span>
                </div>
              ))}
            </div>
            {/* Group Chat Messages */}
            {groupLoading ? (
              <p className="text-center py-4">Loading group chat...</p>
            ) : (
              <>
                <div className="flex-1 p-4 overflow-y-auto">
                  {groupMessages.map((msg, idx) => (
                    <div key={idx} className="mb-4">
                      <span className="block text-xs text-gray-400 mb-1">
                        {msg.sender === loggedInUser._id
                          ? "You"
                          : getSenderName(msg.sender)}
                      </span>
                      <div
                        className={`p-2 rounded-md max-w-xs ${
                          msg.sender === loggedInUser._id
                            ? "bg-green-500 text-white ml-auto"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <span className="block text-sm">{msg.text}</span>
                        <span className="block text-xs text-right mt-1 text-gray-600 dark:text-gray-300">
                          {dayjs(msg.createdAt).format("h:mm A")}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={groupMessagesEndRef} />
                </div>
                {/* Group Message Input */}
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-2">
                    <FiPaperclip size={20} />
                  </button>
                  <input
                    value={newGroupMessage}
                    onChange={(e) => setNewGroupMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white rounded-l-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendGroupMessage}
                    className="bg-blue-600 p-2 rounded-r-md hover:bg-blue-500 transition text-white ml-1"
                  >
                    <FiSend size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* DIRECT CHAT VIEW */}
        {activeTab === "direct" && (
          <div className="w-full max-w-4xl h-[70vh] bg-white dark:bg-gray-900 rounded-lg shadow-lg flex">
            {/* Left Sidebar: Collaborators */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 overflow-y-auto">
              <h2 className="text-md font-bold mb-4 text-gray-700 dark:text-gray-200">
                Direct Chats
              </h2>
              <ul className="space-y-2">
                {collaborators
                  .filter((user) => user._id !== loggedInUser._id)
                  .map((user) => (
                    <li
                      key={user._id}
                      className={`p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                        selectedReceiverId === user._id
                          ? "bg-gray-200 dark:bg-gray-700"
                          : ""
                      }`}
                      onClick={() => handleSelectDirectCollaborator(user._id)}
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={user.photoUrl || "/default-avatar.png"}
                          alt={user.firstName}
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-gray-800 dark:text-gray-200">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Right Side: Chat Room */}
            <div className="flex-1 p-4">
              {loadingDirect ? (
                <p className="text-center text-gray-500">Loading chat...</p>
              ) : directChatId && selectedReceiverId ? (
                // ChatRoom handles displaying name/profile inside
                <ChatRoom
                  chatId={directChatId}
                  userId={loggedInUser._id}
                  receiverId={selectedReceiverId}
                  onClose={() => {
                    setDirectChatId(null);
                    setSelectedReceiverId(null);
                  }}
                  isGroup={false}
                />
              ) : (
                <p className="text-center text-gray-400">
                  Select a collaborator to start chatting.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollabChatPage;
