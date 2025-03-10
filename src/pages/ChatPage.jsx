import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import ChatRoom from "../components/ChatRoom";

const ChatPage = () => {
  const { projectId, chatId } = useParams();
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualChatId, setActualChatId] = useState(null);  

  // ✅ Log params to debug
  useEffect(() => {
    console.log("Params:", { projectId, chatId });
  }, [projectId, chatId]);

  // ✅ Fetch Collaborators
  useEffect(() => {
    const fetchCollaborators = async () => {
      if (projectId) {
        try {
          const res = await axios.get(`${BASE_URL}/api/project/${projectId}/users`, {
            withCredentials: true,
          });
          setCollaborators(res.data.data);
        } catch (err) {
          console.error("Failed to fetch collaborators:", err);
        } finally {
          setLoading(false);
        }
      } else {
        console.warn("Project ID is undefined!");
      }
    };

    fetchCollaborators();
  }, [projectId]);

  // ✅ Fetch Actual Group Chat ID if chatId is "group"
  useEffect(() => {
    const fetchGroupChatId = async () => {
      if (chatId === "group" && projectId) {
        try {
          const res = await axios.post(
            `${BASE_URL}/api/chat/group`,
            { projectId },  // Send projectId to get or create group chat
            { withCredentials: true }
          );
          setActualChatId(res.data.data._id);  // ✅ Store the actual chat ID
          console.log("Fetched Group Chat ID:", res.data.data._id);
        } catch (err) {
          console.error("Failed to fetch group chat ID:", err);
        }
      } else {
        setActualChatId(chatId);  // If not "group", use the provided chatId
      }
    };

    fetchGroupChatId();
  }, [chatId, projectId]);

  return (
    <div className="flex flex-col items-center py-4 bg-gray-900 min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-4 text-blue-400">Chat Room</h2>
      
      {/* Collaborators List */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg mb-4 p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Collaborators</h3>
        {loading ? (
          <p className="text-gray-500">Loading collaborators...</p>
        ) : (
          <ul className="space-y-2">
            {collaborators.map((user) => (
              <li key={user._id} className="flex items-center gap-2 text-gray-700">
                <img
                  src={user.photoUrl || "/default-avatar.png"}
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full"
                />
                <span>
                  {user.firstName} {user.lastName} - {user.emailId}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ Pass actualChatId if available */}
      {actualChatId ? (
        <ChatRoom chatId={actualChatId} />
      ) : (
        <p className="text-red-500">Loading chat...</p>
      )}
    </div>
  );
};

export default ChatPage;
