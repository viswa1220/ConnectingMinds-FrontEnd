import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { motion } from "framer-motion";
import {
  FiUserPlus,
  FiBriefcase,
  FiStar,
  FiCalendar,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import dayjs from "dayjs";
import { Link } from "react-router";
import { getSkillColor } from "../utils/skillColors";

const UnconnectedPeopleFeed = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [connectionStatus, setConnectionStatus] = useState({});

  // Fetch suggested users based on interests
  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/people/suggestions`, {
          params: { page, limit: 10 },
          withCredentials: true,
        });
        setPeople(res.data.data);
        fetchConnectionStatuses(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch suggestions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [page]);

  // Fetch connection statuses
  const fetchConnectionStatuses = async (users) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/people/requests`, {
        withCredentials: true,
      });
      const statuses = {};
      res.data.data.forEach((request) => {
        const userId =
          request.fromUserId._id === request.toUserId._id
            ? request.toUserId._id
            : request.fromUserId._id;
        statuses[userId] = request.status;
      });
      setConnectionStatus(statuses);
    } catch (err) {
      console.error("Failed to fetch connection statuses:", err);
    }
  };

  // Send connection request
  const sendRequest = async (userId) => {
    try {
      await axios.post(
        `${BASE_URL}/api/people/request/send/${userId}`,
        {},
        { withCredentials: true }
      );
      setConnectionStatus((prev) => ({
        ...prev,
        [userId]: "pending",
      }));
      alert("Connection request sent!");
    } catch (err) {
      console.error("Failed to send request:", err);
    }
  };

  if (loading)
    return <div className="text-center text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (people.length === 0)
    return (
      <div className="bg-[#8F8AC3] min-h-screen text-center text-gray-400">
        No suggestions found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#8F8AC3] text-white p-10">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          to="/feed"
          className="text-white inline-flex items-center hover:underline"
        >
          <FiArrowLeft className="mr-2" /> Back to Feed
        </Link>
      </div>

      <h2 className="text-4xl font-bold mb-8 text-center">Suggested People</h2>

      {/* Grid Layout: 3 cards per row */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {people.map((user) => (
          <motion.div
            key={user._id}
            className="p-6 bg-white text-[#4B4896] rounded-xl shadow-lg hover:shadow-2xl transition-all border border-gray-200 relative"
            whileHover={{ scale: 1.02 }}
          >
            {/* Connect Button at Top Right */}
            {connectionStatus[user._id] === "accepted" ? (
              <span className="absolute top-3 right-3 bg-blue-600 text-xs text-white px-3 py-1 rounded-full">
                <FiCheckCircle className="inline-block mr-1" />
                Connected
              </span>
            ) : connectionStatus[user._id] === "pending" ? (
              <span className="absolute top-3 right-3 bg-yellow-500 text-xs text-white px-3 py-1 rounded-full">
                <FiUserPlus className="inline-block mr-1" />
                Pending
              </span>
            ) : (
              <button
                onClick={() => sendRequest(user._id)}
                className="absolute top-3 right-3 bg-green-600 hover:bg-green-500 p-2 rounded-full transition"
                title="Connect"
              >
                <FiUserPlus className="text-white" size={18} />
              </button>
            )}

            {/* Profile Info */}
            <div className="flex items-center mb-4">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt="Profile"
                  className="w-14 h-14 rounded-full object-cover border border-gray-300 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-[#4B4896]">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
              )}
              <div className="ml-3">
                <h3 className="text-lg font-bold">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  <FiBriefcase className="mr-1 inline" />{" "}
                  {user.about || "No job title available"}
                </p>
              </div>
            </div>

            {/* Experience & Joining Date */}
            <p className="text-sm text-gray-600 flex items-center">
              <FiStar className="mr-1" /> Experience:{" "}
              {user.experience || "Not specified"} years
            </p>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <FiCalendar className="mr-1" /> Joined:{" "}
              {dayjs(user.createdAt).format("DD MMM YYYY")}
            </p>

            {/* Tech Stack */}
            <div className="mt-3">
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Tech Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.techStack?.length > 0 ? (
                  user.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-green-300 text-green-900 rounded-full"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">
                    No tech stack specified
                  </span>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="mt-3">
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.skills?.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-xs rounded-full ${getSkillColor(
                        skill
                      )}`}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">
                    No skills specified
                  </span>
                )}
              </div>
            </div>

            {/* Interests */}
            <div className="mt-3">
              <h4 className="text-sm font-semibold text-gray-600 mb-1">
                Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.interests?.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs bg-purple-300 text-purple-900 rounded-full"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">
                    No interests specified
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default UnconnectedPeopleFeed;
