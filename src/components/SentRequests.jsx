import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUserCheck,
  FiClock,
  FiXCircle,
  FiArrowLeft,
  FiStar,
  FiCode,
  FiMail,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { getSkillColor } from "../utils/skillColors";

const SentRequests = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending', 'accepted', 'rejected'

  const loggedInUser = useSelector((state) => state.user);
  const loggedInUserId = loggedInUser?._id;

  // Early return if user info isn't available yet
  if (!loggedInUserId) {
    return <div className="text-center text-gray-400">Loading user info...</div>;
  }

  useEffect(() => {
    const fetchSentRequests = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/people/requests`, {
          withCredentials: true,
        });
        console.log("All sent requests:", res.data.data);
        // Filter to only those requests sent by the logged-in user (compare as strings)
        const filtered = res.data.data.filter(
          (req) =>
            req.fromUserId._id.toString() === loggedInUserId.toString()
        );
        console.log("Filtered sent requests:", filtered);
        setSentRequests(filtered);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch sent requests."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSentRequests();
  }, [loggedInUserId]);

  // Filter requests based on active tab
  const filteredRequests = sentRequests.filter(
    (req) => req.status === activeTab
  );

  if (loading)
    return <div className="text-center text-gray-400">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500">{error}</div>;
  if (sentRequests.length === 0) {
    return (
      <div className="bg-[#8F8AC3] min-h-screen text-center text-gray-400">
        No sent requests found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#8F8AC3] p-10 text-white">
    {/* Page Title */}
    <h2 className="text-4xl font-bold text-center mb-8">Sent Requests</h2>
  
    {/* Back Button */}
    <div className="flex justify-start mb-6">
      <Link to="/feed" className="flex items-center text-white hover:text-gray-300 transition">
        <FiArrowLeft size={18} className="mr-2" />
        Back to Feed
      </Link>
    </div>
  
    {/* Tabs for Filtering Requests */}
    <div className="flex justify-center mb-6 space-x-4">
      {["pending", "accepted", "rejected"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-full transition ${
            activeTab === tab ? "bg-[#4B4896] text-white" : "bg-gray-200 text-gray-800"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
  
    {/* Requests Grid */}
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto max-w-[85%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {filteredRequests.length > 0 ? (
        filteredRequests.map((request) => {
          const user = request.toUserId;
          const skillsArray = Array.isArray(user.skills)
            ? user.skills
            : typeof user.skills === "string"
            ? user.skills.split(",").map((s) => s.trim())
            : [];
            
          return (
            <motion.div
            key={request._id}
            className="rounded-xl shadow-md p-5 bg-white text-[#4B4896] flex flex-col justify-between border border-gray-200 hover:shadow-xl transition-all"
            whileHover={{ scale: 1.02 }}
          >
            {/* Profile Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt="Profile"
                    className="w-14 h-14 rounded-full mr-4 object-cover border border-gray-300 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-[#4B4896]">
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold flex items-center">
                    {user.firstName} {user.lastName}
                    {/* Status Badge (Right-aligned on name line) */}
                    {request.status === "pending" && (
                      <span className="ml-3 px-2 py-1 text-xs rounded-full bg-yellow-500 text-white">
                        <FiClock className="inline-block mr-1" />
                        Pending
                      </span>
                    )}
                    {request.status === "accepted" && (
                      <span className="ml-3 px-2 py-1 text-xs rounded-full bg-green-500 text-white">
                        <FiUserCheck className="inline-block mr-1" />
                        Connected
                      </span>
                    )}
                    {request.status === "rejected" && (
                      <span className="ml-3 px-2 py-1 text-xs rounded-full bg-red-500 text-white">
                        <FiXCircle className="inline-block mr-1" />
                        Rejected
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FiMail className="mr-1" />
                    {user.emailId}
                  </p>
                </div>
              </div>
            </div>
          
            {/* Skills Section */}
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-600 mb-1">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skillsArray.length > 0 ? (
                  skillsArray.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-xs rounded-full ${getSkillColor(skill)}`}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                    Not provided
                  </span>
                )}
              </div>
            </div>
          
            {/* Sent Date */}
            <p className="text-sm text-gray-500 flex items-center">
              <FiClock className="mr-1" />
              Sent on: {dayjs(request.createdAt).format("DD MMM YYYY")}
            </p>
          </motion.div>
          
          );
        })
      ) : (
        <div className="text-center text-gray-400 w-full col-span-3">
          No {activeTab} requests found.
        </div>
      )}
    </motion.div>
  </div>
  
  );
};

export default SentRequests;
