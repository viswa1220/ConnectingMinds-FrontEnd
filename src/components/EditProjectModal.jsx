import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { FiX } from "react-icons/fi";

const EditProjectModal = ({ isOpen, onClose, project, onUpdate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [interestsTags, setInterestsTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🛠 Use useEffect to update state when the project prop changes
  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
      setSkillsRequired((project.skillsRequired || []).join(", "));
      setInterestsTags((project.interestsTags || []).join(", "));
    }
  }, [project]);  // Runs every time the `project` prop changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updatedData = {
        title,
        description,
        skillsRequired: skillsRequired.split(",").map((s) => s.trim()),
        interestsTags: interestsTags.split(",").map((t) => t.trim()),
      };

      const res = await axios.patch(
        `${BASE_URL}/api/project/${project._id}/edit`,
        updatedData,
        { withCredentials: true }
      );

      alert("Project updated successfully!");
      onUpdate(res.data.data);  // Update the parent component
      onClose();  // Close the modal
    } catch (err) {
      console.error("Failed to update project:", err);
      setError(err.response?.data?.message || "Failed to update project.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-lg w-full relative text-white">
        <button
          className="absolute top-4 right-4 text-white hover:text-red-400"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>
        <h3 className="text-2xl font-bold mb-4 text-blue-400">
          Edit Project
        </h3>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm mb-1">Title</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Description</label>
            <textarea
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Skills Required (comma-separated)</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={skillsRequired}
              onChange={(e) => setSkillsRequired(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm mb-1">Interests Tags (comma-separated)</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-700 text-white"
              value={interestsTags}
              onChange={(e) => setInterestsTags(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 rounded bg-blue-600 hover:bg-blue-500 transition"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;
