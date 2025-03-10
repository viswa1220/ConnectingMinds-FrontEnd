import React, { useState, useEffect } from "react";
import { fetchCollaborators } from "../api/projectApi";
import { useNavigate } from "react-router-dom";
import defaultProfilePic from "../assets/defaultProfilePic.png"; // Default image if no photoUrl

const CollaboratorsList = ({ projectId, userId }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch collaborators when component mounts
  useEffect(() => {
    const getCollaborators = async () => {
      try {
        const data = await fetchCollaborators(projectId);
        setCollaborators(data);
      } catch (err) {
        setError("Failed to load collaborators.");
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    getCollaborators();
  }, [projectId]);

  // Handle starting a direct chat
  const handleChatStart = async (collaboratorId) => {
    try {
      const response = await fetch("http://localhost:3000/api/chat/direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",  // Send cookies for authentication
        body: JSON.stringify({ userId: collaboratorId }),
      });
      const data = await response.json();
      if (response.ok) {
        // Navigate to the chat page with the chat ID
        navigate(`/chat/${data.data._id}`);
      } else {
        console.error("Error starting chat:", data.message);
      }
    } catch (err) {
      console.error("Failed to start chat:", err.message);
    }
  };

  // Loading state
  if (loading) {
    return <p className="text-center text-gray-500">Loading collaborators...</p>;
  }

  // Error state
  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="p-4 bg-white shadow rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Group Members</h3>
      <ul className="space-y-3">
        {collaborators.map((collaborator) => (
          <li
            key={collaborator._id}
            className="flex items-center p-2 border-b last:border-b-0"
          >
            <img
              src={collaborator.photoUrl || defaultProfilePic}
              alt={collaborator.firstName}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {collaborator.firstName} {collaborator.lastName}
              </p>
              <p className="text-xs text-gray-500">{collaborator.emailId}</p>
            </div>
            {collaborator._id !== userId && (
              <button
                className="text-blue-500 text-sm"
                onClick={() => handleChatStart(collaborator._id)}
              >
                Message
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CollaboratorsList;
