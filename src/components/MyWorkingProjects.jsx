import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { FiMessageCircle, FiUsers, FiArrowLeft, FiClipboard } from "react-icons/fi"; // ✅ Added FiClipboard
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import CollabChatPage from "./CollabChatPage";
import { getSkillColor } from "../utils/skillColors";

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
    <div className="min-h-screen bg-[#8F8AC3] p-10 text-white">
  {/* Page Title */}
  <h2 className="text-4xl font-bold text-center mb-8">My Working Projects</h2>

  {/* Back Button */}
  <div className="flex justify-start mb-6">
    <button
      className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-md hover:bg-red-500 transition"
      onClick={() => navigate(-1)}
    >
      <FiArrowLeft size={18} />
      Back
    </button>
  </div>

  {/* Project Cards */}
  <motion.div
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto max-w-[85%]"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    {projects.map((proj) => (
      <motion.div
        key={proj._id}
        className="rounded-xl shadow-md p-5 bg-white text-[#4B4896] flex flex-col justify-between border border-gray-200 hover:shadow-xl transition-all relative"
        whileHover={{ scale: 1.02 }}
      >
        {/* Buttons (Icons at the Top) */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => navigate(`/collab-chat/${proj._id}/group`)}
            className="p-2 bg-purple-500 hover:bg-purple-400 text-white rounded-md transition"
            title="Chat"
          >
            <FiMessageCircle size={18} />
          </button>
          <button
            onClick={() => navigate(`/projects/${proj._id}/tasks`)}
            className="p-2 bg-yellow-500 hover:bg-yellow-400 text-white rounded-md transition"
            title="Manage Tasks"
          >
            <FiClipboard size={18} />
          </button>
        </div>

        {/* Project Title */}
        <h3 className="text-2xl font-bold mb-2 truncate text-[#4B4896]">
          {proj.title || "Untitled Project"}
        </h3>

        {/* Created Date */}
        <p className="text-sm text-gray-500 mb-2">
          Created on:{" "}
          <span className="text-gray-700">
            {dayjs(proj.createdAt).format("MMM DD, YYYY")}
          </span>
        </p>

        {/* Description */}
        <p className="text-md mb-4 text-gray-600 line-clamp-3">
          {proj.description || "No description available."}
        </p>

        {/* Skills Section */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {proj.skillsRequired?.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-md text-xs font-medium shadow-md ${getSkillColor(
                  skill
                )}`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Tags Section */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Tags:</h4>
          <div className="flex flex-wrap gap-2">
            {proj.interestsTags?.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs bg-indigo-300 text-indigo-900 rounded-full shadow-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Collaborators */}
        <p className="text-sm text-gray-700">
          <strong>Collaborators:</strong> {proj.collaborators?.length || 0}
        </p>
      </motion.div>
    ))}
  </motion.div>

  {/* Render CollabChatPage directly if a chat is open */}
  {isChatOpen && selectedProject && (
    <CollabChatPage projectId={selectedProject._id} chatId="group" />
  )}
</div>

  );
};

export default MyWorkingProjects;