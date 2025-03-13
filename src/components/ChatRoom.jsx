import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../utils/socket";
import { BASE_URL } from "../utils/constants";
import { FiSend, FiArrowLeft, FiPaperclip, FiX } from "react-icons/fi";
import dayjs from "dayjs";

const ChatRoom = ({ chatId, userId, receiverId, onClose, isGroup = false }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const dummyRef = useRef(null);

  // Fetch receiver or group info
  useEffect(() => {
    const fetchReceiverInfo = async () => {
      try {
        if (isGroup) {
          setReceiver({ firstName: "Group", lastName: "Chat", emailId: "" });
        } else {
          const res = await axios.get(`${BASE_URL}/api/user/${receiverId}`, {
            withCredentials: true,
          });
          setReceiver(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch receiver info:", err);
      }
    };
    if (receiverId || isGroup) fetchReceiverInfo();
  }, [receiverId, isGroup]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/chat/${chatId}/messages`, {
          withCredentials: true,
        });
        setMessages(res.data.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    if (chatId) fetchMessages();
  }, [chatId]);

  // Setup socket listeners for incoming messages
  useEffect(() => {
    socket.emit("joinRoom", { chatId });
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, [chatId]);

  // Auto-scroll to latest message
  useEffect(() => {
    dummyRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSend = () => {
    if (message.trim()) {
      socket.emit("sendMessage", { chatId, senderId: userId, text: message });
      setMessage("");
    }
  };

  // Helper: Get initials from full name
  const getInitials = (name) => {
    const parts = name?.split(" ");
    return parts?.map((p) => p.charAt(0).toUpperCase()).join("").slice(0, 2);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl h-[65vh] bg-white text-[#4B4896] rounded-lg shadow-lg overflow-hidden border border-gray-300">
    {/* Header */}
    <div className="flex items-center justify-between bg-[#8F8AC3] text-white px-4 py-3">
      {/* Back Button */}
      <button onClick={onClose} className="text-white hover:text-gray-200">
        <FiArrowLeft size={24} />
      </button>
  
      {/* Receiver Info */}
      {receiver && (
        <div className="flex items-center">
          {receiver.photoUrl ? (
            <img
              src={receiver.photoUrl}
              alt="Receiver"
              className="w-10 h-10 rounded-full mr-3 border-2 border-white"
            />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#4B4896] text-white mr-3">
              {getInitials(`${receiver.firstName} ${receiver.lastName}`)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold">{receiver.firstName} {receiver.lastName}</h3>
            {receiver.emailId && (
              <p className="text-xs text-gray-200">{receiver.emailId}</p>
            )}
          </div>
        </div>
      )}
  
      {/* Close Button */}
      <button onClick={onClose} className="text-white hover:text-gray-200">
        <FiX size={24} />
      </button>
    </div>
  
    {/* Chat Messages */}
    <div className="flex-1 px-4 py-2 overflow-y-auto bg-white">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`flex mb-3 ${msg.sender._id === userId ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded-lg shadow ${
              msg.sender._id === userId
                ? "bg-[#4B4896] text-white"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            <p className="text-sm">{msg.text}</p>
            <p className="text-xs mt-1 text-right text-gray-500">
              {dayjs(msg.createdAt).format("h:mm A")}
            </p>
          </div>
        </div>
      ))}
      <div ref={dummyRef} />
    </div>
  
    {/* Message Input */}
    <div className="flex items-center p-4 bg-[#8F8AC3] border-t border-gray-300">
      <button className="p-2 text-white hover:text-gray-200">
        <FiPaperclip size={20} />
      </button>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        className="flex-1 mx-3 p-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none"
      />
      <button
        onClick={handleSend}
        className="p-2 bg-[#4B4896] hover:bg-[#3A3778] text-white rounded-lg transition"
      >
        <FiSend size={20} />
      </button>
    </div>
  </div>
  
  );
};

export default ChatRoom;
