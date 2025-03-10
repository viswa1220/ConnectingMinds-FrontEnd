import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { FiUserPlus, FiBriefcase, FiStar, FiCalendar, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import dayjs from "dayjs";
import { Link } from "react-router";

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

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (people.length === 0) return <div className="text-center text-gray-400">No suggestions found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
        <Link to="/" className="text-blue-400 mb-4 inline-block">
        <FiArrowLeft className="inline mr-2" /> Back to feed
      </Link>
      <h2 className="text-4xl font-bold mb-8 text-center text-blue-400">
        Suggested People
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((user) => (
          <div
            key={user._id}
            className="p-4 bg-gradient-to-b from-gray-800 to-gray-700 rounded-lg shadow-lg"
          >
            <div className="flex items-center mb-4">
              <img
                src={user.photoUrl || "https://via.placeholder.com/50"}
                alt="Profile"
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <h3 className="text-xl font-bold text-yellow-400">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-400">
                  <FiBriefcase className="inline mr-1" />
                  {user.about || "No job title available"}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-2">
              <FiStar className="inline mr-1" />
              Experience: {user.experience || "Not specified"} years
            </p>

            <p className="text-sm text-gray-400 mb-2">
              <FiCalendar className="inline mr-1" />
              Joined: {dayjs(user.createdAt).format("DD MMM YYYY")}
            </p>

            {/* Tech Stack */}
            <div className="mb-2">
              <h4 className="text-sm text-blue-300 mb-1">Tech Stack:</h4>
              <ul className="flex flex-wrap gap-1">
                {user.techStack?.length > 0 ? (
                  user.techStack.map((tech, index) => (
                    <li key={index} className="text-xs bg-green-700 px-2 py-1 rounded-full">
                      {tech}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-400">No tech stack specified</li>
                )}
              </ul>
            </div>

            {/* Skills */}
            <div className="mb-2">
              <h4 className="text-sm text-blue-300 mb-1">Skills:</h4>
              <ul className="flex flex-wrap gap-1">
                {user.skills?.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <li key={index} className="text-xs bg-blue-700 px-2 py-1 rounded-full">
                      {skill}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-400">No skills specified</li>
                )}
              </ul>
            </div>

            {/* Interests */}
            <div className="mb-2">
              <h4 className="text-sm text-blue-300 mb-1">Interests:</h4>
              <ul className="flex flex-wrap gap-1">
                {user.interests?.length > 0 ? (
                  user.interests.map((interest, index) => (
                    <li key={index} className="text-xs bg-purple-700 px-2 py-1 rounded-full">
                      {interest}
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-gray-400">No interests specified</li>
                )}
              </ul>
            </div>

            {/* Connect Button */}
            {connectionStatus[user._id] === "accepted" ? (
              <div className="mt-4 p-2 w-full bg-blue-600 rounded-full text-center">
                <FiCheckCircle className="inline-block mr-2" />
                Connected
              </div>
            ) : connectionStatus[user._id] === "pending" ? (
              <div className="mt-4 p-2 w-full bg-yellow-600 rounded-full text-center">
                <FiUserPlus className="inline-block mr-2" />
                Pending
              </div>
            ) : (
              <button
                onClick={() => sendRequest(user._id)}
                className="mt-4 p-2 w-full bg-green-600 hover:bg-green-500 rounded-full transition"
              >
                <FiUserPlus className="inline-block mr-2" />
                Connect
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnconnectedPeopleFeed;
