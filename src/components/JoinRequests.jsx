import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const JoinRequests = () => {
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch join requests
  useEffect(() => {
    const fetchJoinRequests = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/projects/my-projects`, {
          withCredentials: true,
        });
        const projects = res.data.data;

        const allRequests = await Promise.all(
          projects.map(async (project) => {
            const res = await axios.get(
              `${BASE_URL}/api/project/${project._id}/requests`,
              { withCredentials: true }
            );
            return res.data.data.map((req) => ({
              ...req,
              projectTitle: project.title,
            }));
          })
        );

        setJoinRequests(allRequests.flat());
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchJoinRequests();
  }, []);

  // Accept or Reject a request using the correct API endpoints
  const handleRequestAction = async (projectId, requestId, action) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/project/${projectId}/request/${requestId}/${action}`,
        {},
        { withCredentials: true }
      );
      setJoinRequests((prev) =>
        prev.filter((req) => req._id !== requestId)
      );
    } catch (err) {
      console.error("Failed to update request:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#8F8AC3] p-10 text-white">
    {/* Page Title */}
    <h2 className="text-4xl font-bold mb-8 text-center">Join Requests</h2>
  
    {/* Loading & Error States */}
    {loading ? (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-center text-gray-300 animate-pulse">Loading requests...</p>
      </div>
    ) : error ? (
      <p className="text-center text-red-500">{error}</p>
    ) : joinRequests.length === 0 ? (
      <p className="text-center text-gray-300">No pending join requests.</p>
    ) : (
      <motion.div
  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto max-w-[85%]"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  {joinRequests.map((req) => (
    <motion.div
      key={req._id}
      className="rounded-xl shadow-md p-4 bg-white text-[#4B4896] flex flex-col justify-between border border-gray-200 hover:shadow-xl transition-all"
      whileHover={{ scale: 1.02 }}
    >
      {/* Profile Info */}
      <div className="flex items-center mb-3">
        {req.userId.photoUrl ? (
          <img
            src={req.userId.photoUrl}
            alt="Profile"
            className="w-12 h-12 rounded-full mr-3 object-cover border border-gray-300 shadow-sm"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-[#4B4896]">
            {req.userId.firstName[0]}
            {req.userId.lastName[0]}
          </div>
        )}
        <div>
          <h3 className="text-md font-bold">{req.userId.firstName} {req.userId.lastName}</h3>
          <p className="text-xs text-gray-500">{req.userId.emailId}</p>
        </div>
      </div>

      {/* Request Details */}
      <div className="flex-grow text-gray-700 text-sm">
        <p className="font-semibold mb-1">📌 Project:</p>
        <p className="mb-2">{req.projectTitle}</p>

        <p className="font-semibold mb-1">📨 Message:</p>
        <p className="mb-2 italic">{req.message || "No message provided."}</p>

        <p className="font-semibold mb-1">👔 Role:</p>
        <p className="mb-2">{req.role || "Not specified"}</p>

        <p className="font-semibold mb-1">📅 Requested On:</p>
        <p className="mb-2">{dayjs(req.createdAt).format("MMM D, YYYY")}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-3">
        <button
          className="flex-1 py-2 bg-green-500 hover:bg-green-400 text-white rounded-md font-semibold transition"
          onClick={() => handleRequestAction(req.projectId, req._id, "accept")}
        >
          ✅ Accept
        </button>
        <button
          className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-white rounded-md font-semibold transition"
          onClick={() => handleRequestAction(req.projectId, req._id, "reject")}
        >
          ❌ Reject
        </button>
      </div>
    </motion.div>
  ))}
</motion.div>

    )}
  </div>
  
  );
};

export default JoinRequests;
