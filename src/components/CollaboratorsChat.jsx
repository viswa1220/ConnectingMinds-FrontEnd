import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { FiSend, FiUser, FiUsers } from "react-icons/fi";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

const CollaboratorsChat = ({ projectId, onChatLoaded }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [selectedChat, setSelectedChat] = useState("group");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const loggedInUser = useSelector((state) => state.user);

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

    fetchCollaborators();
  }, [projectId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(`${BASE_URL}/api/chat/${selectedChat}/message`, {
        text: newMessage,
      }, { withCredentials: true });
      setMessages([...messages, res.data.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-4">
        <button className="p-2 bg-blue-500 rounded" onClick={() => setSelectedChat("group")}>Group Chat</button>
        {collaborators.map((col) => (
          <button key={col._id} className="p-2 bg-gray-700 rounded" onClick={() => setSelectedChat(col._id)}>
            {col.firstName}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className="p-2">
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          className="flex-1 p-2 border rounded"
        />
        <button onClick={handleSendMessage} className="p-2 bg-green-500">
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default CollaboratorsChat;
