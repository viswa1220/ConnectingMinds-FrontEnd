import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import dayjs from "dayjs";
import { FiUserPlus, FiBookmark } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getSkillColor } from "../utils/skillColors";
const FeedPage = () => {
  const [viewMode, setViewMode] = useState("feed"); // "feed" or "saved"
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [joinModal, setJoinModal] = useState({
    isOpen: false,
    projectId: null,
  });
  const [ignoreModal, setIgnoreModal] = useState({
    isOpen: false,
    projectId: null,
  });
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIgnoring, setIsIgnoring] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/projects/feed`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
        params: { search: searchQuery },
      });
      setProjects(res.data.data);
    } catch (err) {
      console.error("Failed to fetch project feed:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Function to fetch saved projects (only open projects)
  const fetchSavedProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/projects/saved`, {
        withCredentials: true,
      });
      setProjects(res.data.data);
    } catch (err) {
      console.error("Failed to fetch saved projects:", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load projects when viewMode or searchQuery changes.
  useEffect(() => {
    if (viewMode === "feed") {
      fetchProjects();
    } else if (viewMode === "saved") {
      fetchSavedProjects();
    }
  }, [viewMode, searchQuery]);

  const handleJoinProject = async () => {
    if (!role) {
      alert("Please enter a role to join the project.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/project/join/${joinModal.projectId}`,
        { role, message },
        { withCredentials: true }
      );
      alert(res.data.message || "Join request sent successfully!");
      setJoinModal({ isOpen: false, projectId: null });
      setRole("");
      setMessage("");
    } catch (err) {
      console.error("Failed to send join request:", err);
      alert(err.response?.data?.message || "Failed to send join request!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProject = async (projectId) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/project/${projectId}/save`,
        {},
        { withCredentials: true }
      );
      alert(res.data.message || "Project saved for future reference!");
    } catch (err) {
      console.error("Failed to save project:", err);
      alert(err.response?.data?.message || "Failed to save project!");
    }
  };

  const handleIgnoreProject = async (projectId) => {
    setIsIgnoring(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/project/${projectId}/ignore`,
        {},
        { withCredentials: true }
      );
      alert(res.data.message || "Project ignored!");
      // Refresh the list based on current view
      if (viewMode === "feed") {
        fetchProjects();
      } else if (viewMode === "saved") {
        fetchSavedProjects();
      }
      setIgnoreModal({ isOpen: false, projectId: null });
    } catch (err) {
      console.error("Failed to ignore project:", err);
      alert(err.response?.data?.message || "Failed to ignore project!");
    } finally {
      setIsIgnoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#8F8AC3] py-6 px-4">
      {/* Title */}
      <h3 className="text-3xl font-bold mb-6 text-white text-center">
        Explore Projects
      </h3>

      {/* Search & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered w-full md:w-96 bg-white text-gray-700 placeholder-gray-400 py-2 px-3 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-3">
          <button
            className={`btn btn-sm ${
              viewMode === "feed" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setViewMode("feed")}
          >
            Project Feed
          </button>
          <button
            className={`btn btn-sm ${
              viewMode === "saved" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setViewMode("saved")}
          >
            Saved for Later
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
        {loadingProjects ? (
          <p className="text-white text-center">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-white text-center">
            {viewMode === "saved"
              ? "No saved projects found."
              : "No projects found in your feed."}
          </p>
        ) : (
          projects.map((proj) => (
            <motion.div
              key={proj._id}
              className="card bg-gray-50 text-gray-800 shadow-md rounded-xl overflow-hidden transition-all"
              // Subtle 3D hover
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              }}
            >
              <div className="card-body p-4">
                {/* Creator Info */}
                <div className="flex items-center mb-4">
                  <img
                    src={proj.createdBy.photoUrl || "/default-profile.png"}
                    alt="creator"
                    className="w-14 h-14 rounded-full mr-4 border-2 border-primary object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-primary">
                      {proj.createdBy.firstName} {proj.createdBy.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {proj.createdBy.emailId}
                    </p>
                  </div>
                </div>

                {/* Project Title & Description */}
                <h3 className="card-title text-xl font-bold mb-2 text-secondary">
                  {proj.title || "Untitled Project"}
                </h3>
                <p className="mb-4 text-gray-600">
                  {proj.description || "No description provided."}
                </p>

                <div className="mb-3">
                  <p className="text-md font-semibold text-gray-700 mb-1">
                    Tech Stack learned:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {proj.skillsRequired?.map((skill, index) => (
                      <span
                        key={index}
                        className={`inline-block px-2 py-1 rounded-md text-sm font-medium ${getSkillColor(
                          skill
                        )}`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Status & Metadata */}
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Status:</strong>{" "}
                  <span className="capitalize">{proj.status}</span>
                </p>
                <div className="flex justify-between items-center text-gray-500 text-sm mb-3">
                  <p>
                    <strong>Collaborators:</strong> {proj.collaborators.length}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {dayjs(proj.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>

                {/* Actions */}
                <div className="card-actions flex justify-between items-center">
                  {viewMode === "feed" && (
                    <>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          setJoinModal({ isOpen: true, projectId: proj._id })
                        }
                      >
                        <FiUserPlus className="mr-1" />
                        Join
                      </button>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-accent"
                          onClick={() => handleSaveProject(proj._id)}
                        >
                          <FiBookmark className="mr-1" />
                          Save
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() =>
                            setIgnoreModal({
                              isOpen: true,
                              projectId: proj._id,
                            })
                          }
                        >
                          Ignore
                        </button>
                      </div>
                    </>
                  )}
                  {viewMode === "saved" && (
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          setJoinModal({ isOpen: true, projectId: proj._id })
                        }
                      >
                        <FiUserPlus className="mr-1" />
                        Join
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() =>
                          setIgnoreModal({ isOpen: true, projectId: proj._id })
                        }
                      >
                        Ignore
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Join Project Modal */}
      <AnimatePresence>
        {joinModal.isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-box bg-white p-6 rounded-lg max-w-lg w-full"
              initial={{ y: "-50%", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "-50%", opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Join Project
              </h2>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full mb-4 p-2 bg-gray-100 rounded text-gray-800"
                placeholder="Enter your role"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mb-4 p-2 bg-gray-100 rounded text-gray-800"
                placeholder="Add a message (optional)"
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button
                  className="btn btn-error"
                  onClick={() =>
                    setJoinModal({ isOpen: false, projectId: null })
                  }
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleJoinProject}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Request"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ignore Confirmation Modal */}
      <AnimatePresence>
        {ignoreModal.isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-box bg-white p-6 rounded-lg max-w-md w-full"
              initial={{ y: "-50%", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "-50%", opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Confirm Ignore
              </h2>
              <p className="mb-6 text-gray-600">
                Are you sure you want to ignore this project? It won't show up
                in your feed (and will be removed from saved projects if
                present).
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    setIgnoreModal({ isOpen: false, projectId: null })
                  }
                  disabled={isIgnoring}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-error"
                  onClick={() => handleIgnoreProject(ignoreModal.projectId)}
                  disabled={isIgnoring}
                >
                  {isIgnoring ? "Processing..." : "Yes, Ignore"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedPage;
