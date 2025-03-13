import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { FiMessageCircle, FiUsers, FiArrowLeft, FiClipboard } from "react-icons/fi"; // ✅ Added FiClipboard
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import CollabChatPage from "./CollabChatPage";

const MyWorkingProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const loggedInUser = useSelector((state) => state.user);
  const loggedInUserId = loggedInUser?._id || null;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkingProjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/projects/my-collaborations`, {
          withCredentials: true,
        });
        setProjects(res.data.data);
        console.log("✅ Projects Fetched:", res.data.data);
      } catch (err) {
        console.error("❌ Failed to fetch working projects:", err);
        setError("Failed to fetch working projects.");
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUserId) fetchWorkingProjects();
  }, [loggedInUserId]);

  if (loading) return <div className="text-white text-center">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (projects.length === 0)
    return <div className="min-h-screen text-gray-400 text-center">No projects found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-4xl font-bold mb-8 text-center text-blue-400">
        My Working Projects
      </h2>
      <button
        className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-md hover:bg-red-500 transition mb-4"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft />
        Back
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <motion.div
            key={proj._id}
            className="p-4 bg-gradient-to-b from-gray-800 to-gray-700 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-2 truncate text-yellow-400">
              {proj.title || "Untitled Project"}
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              Created on:{" "}
              <span className="text-gray-300">
                {dayjs(proj.createdAt).format("MMM DD, YYYY")}
              </span>
            </p>
            <p className="text-md mb-4 text-gray-300 line-clamp-3">
              {proj.description || "No description available."}
            </p>
            <div className="mb-4">
              <h4 className="text-sm text-blue-300 mb-1">Skills:</h4>
              <ul className="flex flex-wrap gap-1">
                {proj.skillsRequired?.slice(0, 3).map((skill, index) => (
                  <li
                    key={index}
                    className="text-xs bg-blue-700 px-2 py-1 rounded-full"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <h4 className="text-sm text-blue-300 mb-1">Tags:</h4>
              <ul className="flex flex-wrap gap-1">
                {proj.interestsTags?.slice(0, 3).map((tag, index) => (
                  <li
                    key={index}
                    className="text-xs bg-green-700 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-400 mb-2">
              Collaborators:{" "}
              <span className="text-gray-300">
                {proj.collaborators?.length || 0}
              </span>
            </p>

            {/* Chat Button */}
            <button
              onClick={() => navigate(`/collab-chat/${proj._id}/group`)}
              className="mt-4 w-full p-2 bg-purple-600 rounded-full text-center hover:bg-purple-500 transition"
            >
              <FiMessageCircle className="inline-block mr-2" />
              Chat
            </button>

            {/* Manage Tasks Button */}
            <button
              className="mt-4 w-full p-2 bg-yellow-600 rounded-full text-center hover:bg-yellow-500 transition"
              onClick={() => navigate(`/projects/${proj._id}/tasks`)} // ✅ Navigate to task management page
              title="Manage Tasks"
            >
              <FiClipboard className="inline-block mr-2" />
              Manage Tasks
            </button>
          </motion.div>
        ))}
      </div>

      {/* Render CollabChatPage directly if a chat is open */}
      {isChatOpen && selectedProject && (
        <CollabChatPage
          projectId={selectedProject._id}
          chatId="group"
        />
      )}
    </div>
  );
};

export default MyWorkingProjects;