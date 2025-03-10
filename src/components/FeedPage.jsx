import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import dayjs from "dayjs";
import { FiPlus, FiUserPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const FeedPage = () => {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [joinModal, setJoinModal] = useState({ isOpen: false, projectId: null });
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/projects/feed`, {
          withCredentials: true,
        });
        setProjects(res.data.data);
      } catch (err) {
        console.error("Failed to fetch project feed:", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h3 className="text-3xl font-semibold mb-8 text-green-400 text-center">
        Explore Projects
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mb-20">
        {loadingProjects ? (
          <p className="text-gray-400 text-center">Loading projects...</p>
        ) : (
          projects.map((proj) => (
            <motion.div
              key={proj._id}
              className="card bg-gray-800 shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
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
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() =>
                      setJoinModal({ isOpen: true, projectId: proj._id })
                    }
                  >
                    <FiUserPlus className="mr-1" />
                    Join Project
                  </button>
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
              <h2 className="text-2xl font-bold mb-4 text-white">Join Project</h2>
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
    </div>
  );
};

export default FeedPage;
