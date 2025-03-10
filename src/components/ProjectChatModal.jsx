import React from "react";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ProjectUsersModal = ({ isOpen, onClose, projectTitle, users }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
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
              onClick={onClose}
            >
              <FiX size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-4 text-blue-400">
              {projectTitle} - Collaborators
            </h3>
            <ul className="space-y-2">
              {users.map((user) => (
                <li
                  key={user._id}
                  className="flex items-center gap-4 bg-gray-700 p-2 rounded-lg text-white"
                >
                  <img
                    src={user.photoUrl || "https://via.placeholder.com/50"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <span className="text-md font-semibold">
                      {user.firstName} {user.lastName}
                    </span>
                    <p className="text-xs text-gray-400">{user.emailId}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectUsersModal;
