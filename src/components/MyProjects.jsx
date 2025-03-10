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

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedProjectAnalytics, setSelectedProjectAnalytics] = useState(null);
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
          skillsRequired: newProject.skillsRequired.split(",").map((skill) => skill.trim()),
          interestsTags: newProject.interestsTags.split(",").map((tag) => tag.trim()),
        },
        { withCredentials: true }
      );
      alert("Project created successfully!");
      setShowCreateModal(false);
      setNewProject({ title: "", description: "", skillsRequired: "", interestsTags: "" });
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
      const res = await axios.get(`${BASE_URL}/api/project/${projectId}/analytics`, {
        withCredentials: true,
      });
      setSelectedProjectAnalytics(res.data.data);
      setShowAnalyticsModal(true);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  // Fetch project users
  const fetchProjectUsers = async (projectId, projectTitle) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/project/${projectId}/users`, {
        withCredentials: true,
      });
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
    <div className="min-h-screen bg-gray-900 text-white p-6 relative">
      <h2 className="text-4xl font-bold mb-8 text-center text-blue-400">My Projects</h2>
      <button
        className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 transition my-2"
        onClick={() => setShowCreateModal(true)}
      >
        <FiPlus />
        Add Project
      </button>
      {loading ? (
        <p className="text-center text-gray-400">Loading projects...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : projects.length === 0 ? (
        <p className="text-center text-gray-400">You have no projects yet.</p>
      ) : (
        <motion.div
          className="overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            drag="x"
            dragConstraints={{ right: 0, left: -((projects.length - 1) * 320) }}
            whileTap={{ cursor: "grabbing" }}
          >
            {projects.map((proj) => (
              <motion.div
                key={proj._id}
                className="rounded-xl shadow-lg p-6 bg-gradient-to-b from-gray-800 to-gray-700 text-white hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-bold mb-2 truncate text-yellow-400">
                  {proj.title || "Untitled Project"}
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  Created on: <span className="text-gray-300">{dayjs(proj.createdAt).format("MMM DD, YYYY")}</span>
                </p>
                <p className="text-md mb-4 text-gray-300 line-clamp-3">
                  {proj.description || "No description available."}
                </p>
                <div className="mb-4">
                  <h4 className="text-sm text-blue-300 mb-1">Skills Learned:</h4>
                  <ul className="flex flex-wrap gap-1">
                    {proj.skillsRequired?.slice(0, 3).map((skill, index) => (
                      <li key={index} className="text-xs bg-blue-700 px-2 py-1 rounded-full">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm text-blue-300 mb-1">Tags:</h4>
                  <ul className="flex flex-wrap gap-1">
                    {proj.interestsTags?.slice(0, 3).map((tag, index) => (
                      <li key={index} className="text-xs bg-green-700 px-2 py-1 rounded-full">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  Collaborators: <span className="text-gray-300">{proj.collaborators?.length || 0}</span>
                </p>
                {/* Action Icons Section */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => handleToggleStatus(proj)}
                    title={proj.status === "open" ? "Mark Closed" : "Mark Open"}
                    className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition"
                  >
                    {proj.status === "open" ? <FiLock size={20} /> : <FiUnlock size={20} />}
                  </button>
                  <button
                    className="p-2 rounded-full bg-green-600 hover:bg-green-500 text-white transition"
                    onClick={() => fetchAnalytics(proj._id)}
                    title="View Analytics"
                  >
                    <FiBarChart2 size={20} />
                  </button>
                  <button
                    className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition"
                    onClick={() => fetchProjectUsers(proj._id, proj.title)}
                    title="View Users"
                  >
                    <FiUsers size={20} />
                  </button>
                  <button
                    className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition"
                    onClick={() => handleEdit(proj)}
                    title="Edit Project"
                  >
                    <FiEdit3 size={20} />
                  </button>
                  <button
                    className="p-2 rounded-full bg-yellow-600 hover:bg-yellow-500 text-white transition"
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
              className="bg-gray-800 p-6 rounded-lg max-w-lg w-full relative text-white"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                className="absolute top-4 right-4 text-white hover:text-red-400"
                onClick={() => setShowAnalyticsModal(false)}
              >
                <FiX size={24} />
              </button>
              <h3 className="text-2xl font-bold mb-4 text-blue-400">
                Project Analytics
              </h3>
              <p>
                <strong>Total Requests:</strong> {selectedProjectAnalytics.totalRequests}
              </p>
              <p>
                <strong>Pending Requests:</strong> {selectedProjectAnalytics.pendingRequests}
              </p>
              <p>
                <strong>Accepted Collaborators:</strong> {selectedProjectAnalytics.acceptedCollaborators}
              </p>
              <p>
                <strong>Top Skills:</strong> {selectedProjectAnalytics.mostCommonSkills.join(", ")}
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
            <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full text-white">
              <h2 className="text-2xl font-bold mb-4">Create Project</h2>
              <input
                type="text"
                placeholder="Title"
                className="w-full mb-4 p-2 bg-gray-700 rounded"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
              />
              <textarea
                placeholder="Description"
                className="w-full mb-4 p-2 bg-gray-700 rounded"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Skills you will learn (comma separated)"
                className="w-full mb-4 p-2 bg-gray-700 rounded"
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
                className="w-full mb-4 p-2 bg-gray-700 rounded"
                value={newProject.interestsTags}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    interestsTags: e.target.value,
                  })
                }
              />
              <div className="flex justify-end gap-4">
                <button
                  className="py-2 px-4 bg-red-500 rounded hover:bg-red-600"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="py-2 px-4 bg-green-600 rounded hover:bg-green-700"
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
