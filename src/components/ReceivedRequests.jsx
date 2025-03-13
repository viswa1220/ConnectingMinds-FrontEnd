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

const ReceivedRequests = () => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get logged-in user ID from Redux store
  const loggedInUser = useSelector((state) => state.user);
  const loggedInUserId = loggedInUser?._id;

  // Fetch received connection requests from the new endpoint
  useEffect(() => {
    const fetchReceivedRequests = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/api/people/requests/received`,
          { withCredentials: true }
        );
        setReceivedRequests(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch requests.");
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUserId) {
      fetchReceivedRequests();
    }
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
      <div className="min-h-screen text-center text-gray-400">
        No received requests found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-4xl font-bold mb-8 text-center text-blue-400">
        Received Requests
      </h2>
      <Link to="/feed" className="text-blue-400 mb-4 inline-block">
        <FiArrowLeft className="inline mr-2" /> Back to Project
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {receivedRequests.map((request) => (
          <div
            key={request._id}
            className="p-4 bg-gradient-to-b from-gray-800 to-gray-700 rounded-lg shadow-lg"
          >
            <div className="flex items-center mb-4">
              <img
                src={
                  request.fromUserId.photoUrl ||
                  "https://via.placeholder.com/50"
                }
                alt="Profile"
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <h3 className="text-xl font-bold text-yellow-400">
                  {request.fromUserId.firstName} {request.fromUserId.lastName}
                </h3>
                <p className="text-sm text-gray-400">
                  <FiMail className="inline mr-1" />
                  {request.fromUserId.emailId}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-2">
              <FiBriefcase className="inline mr-1" />
              {request.fromUserId.about || "No information available"}
            </p>

            {/* Tech Stack Section */}
            <div className="mb-2">
              <h4 className="text-sm font-bold text-blue-300 mb-1">
                Tech Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  let techStackArray = [];
                  if (Array.isArray(request.fromUserId.techStack)) {
                    techStackArray = request.fromUserId.techStack;
                  } else if (
                    typeof request.fromUserId.techStack === "string"
                  ) {
                    techStackArray = request.fromUserId.techStack.split(",");
                  }
                  return techStackArray.length > 0 ? (
                    techStackArray.map((tech, index) => (
                      <button
                        key={index}
                        className="flex items-center bg-blue-600 hover:bg-blue-500 transition text-xs px-3 py-1 rounded-full"
                        disabled
                      >
                        <FiCode className="inline mr-1" />
                        {tech.trim()}
                      </button>
                    ))
                  ) : (
                    <button
                      className="flex items-center bg-blue-600 hover:bg-blue-500 transition text-xs px-3 py-1 rounded-full"
                      disabled
                    >
                      <FiCode className="inline mr-1" />
                      Not provided
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Skills Section */}
            <div className="mb-2">
              <h4 className="text-sm font-bold text-green-300 mb-1">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  let skillsArray = [];
                  if (Array.isArray(request.fromUserId.skills)) {
                    skillsArray = request.fromUserId.skills;
                  } else if (
                    typeof request.fromUserId.skills === "string"
                  ) {
                    skillsArray = request.fromUserId.skills.split(",");
                  }
                  return skillsArray.length > 0 ? (
                    skillsArray.map((skill, index) => (
                      <button
                        key={index}
                        className="flex items-center bg-green-600 hover:bg-green-500 transition text-xs px-3 py-1 rounded-full"
                        disabled
                      >
                        <FiStar className="inline mr-1" />
                        {skill.trim()}
                      </button>
                    ))
                  ) : (
                    <button
                      className="flex items-center bg-green-600 hover:bg-green-500 transition text-xs px-3 py-1 rounded-full"
                      disabled
                    >
                      <FiStar className="inline mr-1" />
                      Not provided
                    </button>
                  );
                })()}
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-2">
              <FiClock className="inline mr-1" />
              Received on: {dayjs(request.createdAt).format("DD MMM YYYY")}
            </p>

            {/* Accept and Reject Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleAccept(request._id)}
                className="flex-1 p-2 bg-green-600 rounded-full text-center hover:bg-green-500 transition"
              >
                <FiUserCheck className="inline-block mr-2" />
                Accept
              </button>
              <button
                onClick={() => handleReject(request._id)}
                className="flex-1 p-2 bg-red-600 rounded-full text-center hover:bg-red-500 transition"
              >
                <FiUserX className="inline-block mr-2" />
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceivedRequests;
