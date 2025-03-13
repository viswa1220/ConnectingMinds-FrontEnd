import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import EditProjectModal from "./EditProjectModal";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart2,
  FiEdit3,
  FiX,
  FiUsers,
  FiClipboard,
  FiPlus,
  FiMessageCircle,
  FiLock,
  FiUnlock,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ProjectUsersModal from "./ProjectChatModal";
import { useSelector } from "react-redux";
import { getSkillColor } from "../utils/skillColors";
const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedProjectAnalytics, setSelectedProjectAnalytics] =
    useState(null);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedProjectUsers, setSelectedProjectUsers] = useState([]);
  const [selectedProjectTitle, setSelectedProjectTitle] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    skillsRequired: "",
    interestsTags: "",
  });
  const loggedInUser = useSelector((state) => state.user);
  const loggedInUserId = loggedInUser?._id || null;
  const navigate = useNavigate();

  // Toggle project status (open/closed)
  const handleToggleStatus = async (project) => {
    try {
      const newStatus = project.status === "open" ? "closed" : "open";
      await axios.patch(
        `${BASE_URL}/api/project/${project._id}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      setProjects((prevProjects) =>
        prevProjects.map((proj) =>
          proj._id === project._id ? { ...proj, status: newStatus } : proj
        )
      );
    } catch (err) {
      console.error("Failed to toggle project status:", err);
    }
  };

  // Create new project
  const handleCreateProject = async () => {
    if (
      !newProject.title ||
      !newProject.description ||
      !newProject.skillsRequired ||
      !newProject.interestsTags
    ) {
      alert("Please fill in all fields!");
      return;
    }
    try {
      const res = await axios.post(
        `${BASE_URL}/api/project/create`,
        {
          ...newProject,
          skillsRequired: newProject.skillsRequired
            .split(",")
            .map((skill) => skill.trim()),
          interestsTags: newProject.interestsTags
            .split(",")
            .map((tag) => tag.trim()),
        },
        { withCredentials: true }
      );
      alert("Project created successfully!");
      setShowCreateModal(false);
      setNewProject({
        title: "",
        description: "",
        skillsRequired: "",
        interestsTags: "",
      });
      setProjects((prevProjects) => [res.data.project, ...prevProjects]);
    } catch (err) {
      console.error("Failed to create project:", err);
      alert(err.response?.data?.message || "Failed to create project!");
    }
  };

  // Fetch projects created by the logged-in user
  useEffect(() => {
    const fetchMyProjects = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/api/projects/my-projects?page=${page}&limit=10`,
          { withCredentials: true }
        );
        setProjects(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch projects.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyProjects();
  }, [page]);

  const handleTaskManagement = (projectId) => {
    navigate(`/projects/${projectId}/tasks`);
  };

  // Fetch analytics for a project
  const fetchAnalytics = async (projectId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/project/${projectId}/analytics`,
        {
          withCredentials: true,
        }
      );
      setSelectedProjectAnalytics(res.data.data);
      setShowAnalyticsModal(true);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  // Fetch project users
  const fetchProjectUsers = async (projectId, projectTitle) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/project/${projectId}/users`,
        {
          withCredentials: true,
        }
      );
      setSelectedProjectUsers(res.data.data);
      setSelectedProjectTitle(projectTitle);
      setShowUsersModal(true);
    } catch (err) {
      console.error("Failed to fetch project users:", err);
    }
  };

  const handleEdit = (project) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#8F8AC3] p-10 text-white">
      {/* Page Title */}
      <h2 className="text-4xl font-bold text-center text-white mb-8">
        My Projects
      </h2>

      {/* Add Project Button */}
      <div className=" justify-center mb-6">
        <button
          className="flex items-center gap-2 bg-[#4B4896] px-5 py-3 rounded-xl hover:bg-[#3A3778] transition shadow-lg"
          onClick={() => setShowCreateModal(true)}
        >
          <FiPlus size={18} />
          Add Project
        </button>
      </div>

      {/* Handle Loading & Errors */}
      {loading ? (
        <p className="text-center text-gray-300">Loading projects...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-gray-300">You have no projects yet.</p>
      ) : (
        <motion.div
          className="overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 mx-auto" // Matched Feed Page spacing
            drag="x"
            dragConstraints={{ right: 0, left: -((projects.length - 1) * 320) }} // Ensures smooth scrolling
            whileTap={{ cursor: "grabbing" }}
          >
            {projects.map((proj) => (
              <motion.div
                key={proj._id}
                className="rounded-xl shadow-lg p-5 bg-white text-[#4B4896] hover:shadow-2xl transition-all w-[350px]" // Wider cards to match Feed
                whileHover={{ scale: 1.03 }}
              >
                {/* Project Title */}
                <h3 className="text-xl font-semibold mb-2 truncate text-[#4B4896]">
                  {proj.title || "Untitled Project"}
                </h3>

                {/* Created Date */}
                <p className="text-sm text-gray-600 mb-1">
                  Created on:{" "}
                  <span className="text-gray-700">
                    {dayjs(proj.createdAt).format("MMM DD, YYYY")}
                  </span>
                </p>

                {/* Project Description */}
                <p className="text-sm mb-3 text-gray-600 line-clamp-2">
                  {proj.description || "No description available."}
                </p>

                {/* Skills Section */}
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    Tech Stack:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {proj.skillsRequired?.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 rounded-md text-xs font-medium shadow-md ${getSkillColor(
                          skill
                        )}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags Section */}
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">
                    Tags:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {proj.interestsTags?.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-indigo-300 text-indigo-900 rounded-full shadow-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Collaborators */}
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Collaborators:</strong>{" "}
                  {proj.collaborators?.length || 0}
                </p>

                {/* Action Buttons (Larger Icons, Better Spacing) */}
                <div className="flex justify-between items-center mt-3 space-x-2">
                  <button
                    onClick={() => handleToggleStatus(proj)}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md"
                    title={proj.status === "open" ? "Mark Closed" : "Mark Open"}
                  >
                    {proj.status === "open" ? (
                      <FiLock size={20} />
                    ) : (
                      <FiUnlock size={20} />
                    )}
                  </button>

                  <button
                    className="p-2 rounded-lg bg-green-600 hover:bg-green-500 text-white transition shadow-md"
                    onClick={() => fetchAnalytics(proj._id)}
                    title="View Analytics"
                  >
                    <FiBarChart2 size={20} />
                  </button>

                  <button
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-md"
                    onClick={() => fetchProjectUsers(proj._id, proj.title)}
                    title="View Users"
                  >
                    <FiUsers size={20} />
                  </button>

                  <button
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-md"
                    onClick={() => handleEdit(proj)}
                    title="Edit Project"
                  >
                    <FiEdit3 size={20} />
                  </button>

                  <button
                    className="p-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white transition shadow-md"
                    onClick={() => handleTaskManagement(proj._id)}
                    title="Manage Tasks"
                  >
                    <FiClipboard size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalyticsModal && selectedProjectAnalytics && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg max-w-lg w-full relative text-[#4B4896] shadow-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
                onClick={() => setShowAnalyticsModal(false)}
              >
                <FiX size={24} />
              </button>

              {/* Title */}
              <h3 className="text-2xl font-bold mb-4 text-[#4B4896]">
                Project Analytics
              </h3>

              {/* Analytics Details */}
              <p className="text-lg font-semibold text-gray-800">
                <strong>Total Requests:</strong>{" "}
                <span className="text-gray-600">
                  {selectedProjectAnalytics.totalRequests}
                </span>
              </p>
              <p className="text-lg font-semibold text-gray-800">
                <strong>Pending Requests:</strong>{" "}
                <span className="text-yellow-600">
                  {selectedProjectAnalytics.pendingRequests}
                </span>
              </p>
              <p className="text-lg font-semibold text-gray-800">
                <strong>Accepted Collaborators:</strong>{" "}
                <span className="text-green-600">
                  {selectedProjectAnalytics.acceptedCollaborators}
                </span>
              </p>
              <p className="text-lg font-semibold text-gray-800">
                <strong>Top Skills:</strong>{" "}
                <span className="text-[#4B4896]">
                  {selectedProjectAnalytics.mostCommonSkills.join(", ")}
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={selectedProject}
        onUpdate={(updatedProject) => {
          setProjects((prevProjects) =>
            prevProjects.map((proj) =>
              proj._id === updatedProject._id ? updatedProject : proj
            )
          );
        }}
      />

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full text-[#4B4896] shadow-lg">
              {/* Title */}
              <h2 className="text-2xl font-bold mb-4 text-[#4B4896]">
                Create Project
              </h2>

              {/* Input Fields */}
              <input
                type="text"
                placeholder="Title"
                className="w-full mb-4 p-2 bg-gray-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4B4896]"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
              />

              <textarea
                placeholder="Description"
                className="w-full mb-4 p-2 bg-gray-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4B4896]"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Skills you will learn (comma separated)"
                className="w-full mb-4 p-2 bg-gray-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4B4896]"
                value={newProject.skillsRequired}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    skillsRequired: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Interests Tags (comma separated)"
                className="w-full mb-4 p-2 bg-gray-200 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4B4896]"
                value={newProject.interestsTags}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    interestsTags: e.target.value,
                  })
                }
              />

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  className="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="py-2 px-4 bg-[#10B981] text-white rounded-md hover:bg-[#0F9A75] transition"
                  onClick={handleCreateProject}
                >
                  Create Project
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Modal */}
      <AnimatePresence>
        <ProjectUsersModal
          isOpen={showUsersModal}
          onClose={() => setShowUsersModal(false)}
          projectTitle={selectedProjectTitle}
          users={selectedProjectUsers}
          loggedInUserId={loggedInUserId}
        />
      </AnimatePresence>
    </div>
  );
};

export default MyProjects;
