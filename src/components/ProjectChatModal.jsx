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
          className="bg-white p-6 rounded-lg max-w-lg w-full relative text-[#4B4896] shadow-lg"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
            onClick={onClose}
          >
            <FiX size={24} />
          </button>
  
          {/* Title */}
          <h3 className="text-2xl font-bold mb-4 text-[#4B4896]">
            {projectTitle} - Collaborators
          </h3>
  
          {/* Collaborators List */}
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user._id}
                className="flex items-center gap-4 bg-gray-100 p-3 rounded-lg shadow-md"
              >
                {/* User Avatar */}
                <img
                  src={user.photoUrl || "https://via.placeholder.com/50"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border-2 border-[#4B4896] shadow"
                />
                
                {/* User Info */}
                <div>
                  <span className="text-md font-semibold text-[#4B4896]">
                    {user.firstName} {user.lastName}
                  </span>
                  <p className="text-sm text-gray-600">{user.emailId}</p>
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
