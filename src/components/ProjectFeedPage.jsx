import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const ProjectFeedPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/projects/feed`, {
          withCredentials: true,
        });
        // Check the response structure
        console.log("Project Feed Response:", res.data);
        setProjects(res.data.data); // Ensure `data` is the array of projects
      } catch (err) {
        console.error("Failed to fetch project feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Project Feed</h2>
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white shadow-lg rounded-lg p-4 transition-transform transform hover:scale-105"
            >
              <img
                src={project.photoUrl}
                alt="project"
                className="rounded mb-2 w-full h-32 object-cover"
              />
              <h3 className="text-xl font-bold text-blue-700">
                {project.title}
              </h3>
              <p className="text-gray-600 mb-1">
                Tech Stack:{" "}
                {Array.isArray(project.techStack)
                  ? project.techStack.join(", ")
                  : "No data"}
              </p>
              <p className="text-gray-600 mb-1">
                Collaborators: {project.collaboratorsCount || 0}
              </p>
              <p className="text-gray-600 mb-2">{project.description}</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                Join Project
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectFeedPage;
