import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import {
  FiUserCheck,
  FiUserX,
  FiMail,
  FiBriefcase,
  FiClock,
  FiArrowLeft,
  FiCode,
  FiStar,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { getSkillColor } from "../utils/skillColors";
const ReceivedRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get logged-in user from Redux store
  const loggedInUser = useSelector((state) => state.user);
  const loggedInUserId = loggedInUser?._id;

  // Early return if user info isn't available yet
  if (!loggedInUserId) {
    return <div className="text-center text-gray-400">Loading user info...</div>;
  }

  // Fetch received connection requests when loggedInUserId is available
  useEffect(() => {
    console.log("Logged in user ID:", loggedInUserId);
    const fetchReceivedRequests = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/api/people/requests/received`,
          { withCredentials: true }
        );
        console.log("Fetched received requests:", res.data.data);
        setReceivedRequests(res.data.data);
      } catch (err) {
        console.error("Error fetching received requests:", err);
        setError(err.response?.data?.message || "Failed to fetch requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceivedRequests();
  }, [loggedInUserId]);

  // Handle Accept Request
  const handleAccept = async (requestId) => {
    try {
      await axios.post(
        `${BASE_URL}/api/people/request/review/accepted/${requestId}`,
        {},
        { withCredentials: true }
      );
      setReceivedRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );
    } catch (err) {
      console.error("Failed to accept request:", err);
    }
  };

  // Handle Reject Request
  const handleReject = async (requestId) => {
    try {
      await axios.post(
        `${BASE_URL}/api/people/request/review/rejected/${requestId}`,
        {},
        { withCredentials: true }
      );
      setReceivedRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );
    } catch (err) {
      console.error("Failed to reject request:", err);
    }
  };

  if (loading)
    return <div className="text-center text-gray-400">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500">{error}</div>;
  if (receivedRequests.length === 0)
    return (
      <div className="bg-[#8F8AC3] min-h-screen text-center text-gray-400">
        No received requests found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#8F8AC3] p-10 text-white">
    {/* Page Title */}
    <h2 className="text-4xl font-bold text-center mb-8">Received Requests</h2>
  
    {/* Back Button */}
    <div className="flex justify-start mb-6">
      <Link to="/feed" className="flex items-center text-white hover:text-gray-300 transition">
        <FiArrowLeft size={18} className="mr-2" />
        Back to Projects
      </Link>
    </div>
  
    {/* Requests Grid */}
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto max-w-[85%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {receivedRequests.map((request) => (
        <motion.div
          key={request._id}
          className="rounded-xl shadow-md p-5 bg-white text-[#4B4896] flex flex-col justify-between border border-gray-200 hover:shadow-xl transition-all"
          whileHover={{ scale: 1.02 }}
        >
          {/* Profile Info */}
          <div className="flex items-center mb-4">
            {request.fromUserId.photoUrl ? (
              <img
                src={request.fromUserId.photoUrl}
                alt="Profile"
                className="w-14 h-14 rounded-full mr-4 object-cover border border-gray-300 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-[#4B4896]">
                {request.fromUserId.firstName[0]}
                {request.fromUserId.lastName[0]}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold">{request.fromUserId.firstName} {request.fromUserId.lastName}</h3>
              <p className="text-sm text-gray-500 flex items-center">
                <FiMail className="mr-1" />
                {request.fromUserId.emailId}
              </p>
            </div>
          </div>
  
          {/* About & Skills */}
          <p className="text-sm text-gray-500 mb-2 flex items-center">
            <FiBriefcase className="mr-1" />
            {request.fromUserId.about || "No information available"}
          </p>
  
          {/* Tech Stack Section */}
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">Tech Stack</h4>
            <div className="flex flex-wrap gap-2">
              {request.fromUserId.techStack?.length > 0 ? (
                request.fromUserId.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 text-xs rounded-full ${getSkillColor(tech)}`}
                  >
                    {tech}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Not provided</span>
              )}
            </div>
          </div>
  
          {/* Skills Section */}
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {request.fromUserId.skills?.length > 0 ? (
                request.fromUserId.skills.map((skill, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 text-xs rounded-full ${getSkillColor(skill)}`}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">Not provided</span>
              )}
            </div>
          </div>
  
          {/* Requested On */}
          <p className="text-sm text-gray-500 flex items-center">
            <FiClock className="mr-1" />
            Received on: {dayjs(request.createdAt).format("DD MMM YYYY")}
          </p>
  
          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              className="flex-1 p-2 bg-green-500 hover:bg-green-400 text-white rounded-md transition"
              onClick={() => handleAccept(request._id)}
            >
              <FiUserCheck className="inline-block mr-1" />
              Accept
            </button>
            <button
              className="flex-1 p-2 bg-red-500 hover:bg-red-400 text-white rounded-md transition"
              onClick={() => handleReject(request._id)}
            >
              <FiUserX className="inline-block mr-1" />
              Reject
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </div>
  
  
  );
};

export default ReceivedRequests;
