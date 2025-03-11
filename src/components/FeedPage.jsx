import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import dayjs from "dayjs";
import { FiUserPlus, FiBookmark } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

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

  // Function to fetch feed projects
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/projects/feed`, {
        withCredentials: true,
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
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h3 className="text-3xl font-bold mb-8 text-green-400 text-center">
        Explore Projects
      </h3>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered input-sm w-full md:w-[30rem] bg-gray-800 py-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex gap-4">
          <button
            className={`btn ${
              viewMode === "feed" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setViewMode("feed")}
          >
            Project Feed
          </button>
          <button
            className={`btn ${
              viewMode === "saved" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setViewMode("saved")}
          >
            Saved for Later
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mb-20">
        {loadingProjects ? (
          <p className="text-gray-400 text-center">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-400 text-center">
            {viewMode === "saved"
              ? "No saved projects found."
              : "No projects found in your feed."}
          </p>
        ) : (
          projects.map((proj) => (
            <motion.div
              key={proj._id}
              className="card bg-gray-800 border border-gray-700 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 relative"
              whileHover={{ scale: 1.03 }}
            >
              <div className="card-body p-6">
                <div className="flex items-center mb-6">
                  <img
                    src={proj.createdBy.photoUrl || "/default-profile.png"}
                    alt="creator"
                    className="w-16 h-16 rounded-full mr-5 border-2 border-blue-400 shadow-md object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-lg text-blue-300">
                      {proj.createdBy.firstName} {proj.createdBy.lastName}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {proj.createdBy.emailId}
                    </p>
                  </div>
                </div>
                <h3 className="card-title text-2xl font-bold mb-3 text-yellow-400">
                  {proj.title || "Untitled Project"}
                </h3>
                <p className="mb-5 text-gray-300">
                  {proj.description || "No description provided."}
                </p>
                <div className="mb-4">
                  <p className="text-md font-bold mb-2 text-gray-300">
                    Tech Stack learned:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {proj.skillsRequired?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600 text-white text-sm rounded-md shadow-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-md mt-3 text-gray-300">
                    <strong>Status:</strong>{" "}
                    <span className="capitalize">{proj.status}</span>
                  </p>
                </div>
                <div className="flex justify-between items-center mb-4 text-gray-400">
                  <p className="text-sm">
                    <strong>Collaborators:</strong> {proj.collaborators.length}
                  </p>
                  <p className="text-sm">
                    <strong>Created:</strong>{" "}
                    {dayjs(proj.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>
                <div className="card-actions justify-between">
                  {viewMode === "feed" && (
                    <>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() =>
                          setJoinModal({ isOpen: true, projectId: proj._id })
                        }
                      >
                        <FiUserPlus className="mr-1" />
                        Join Project
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
                        Join Project
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
              className="modal-box bg-gray-800 p-6 rounded-lg max-w-lg w-full"
              initial={{ y: "-50%", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "-50%", opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-white">
                Join Project
              </h2>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full mb-4 p-2 bg-gray-700 rounded text-white"
                placeholder="Enter your role"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full mb-4 p-2 bg-gray-700 rounded text-white"
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
              className="modal-box bg-gray-800 p-6 rounded-lg max-w-md w-full"
              initial={{ y: "-50%", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "-50%", opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-4 text-white">
                Confirm Ignore
              </h2>
              <p className="mb-6 text-gray-300">
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
