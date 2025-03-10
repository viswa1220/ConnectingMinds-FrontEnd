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
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-4xl font-bold mb-8 text-center">Join Requests</h2>
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-center text-gray-400 animate-pulse">
            Loading requests...
          </p>
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : joinRequests.length === 0 ? (
        <p className="text-center text-gray-400">
          No pending join requests.
        </p>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {joinRequests.map((req) => (
            <motion.div
              key={req._id}
              className="rounded-xl shadow-lg p-6 bg-gradient-to-b from-gray-800 to-gray-700 text-white h-[450px] flex flex-col justify-between"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center mb-4">
                {req.userId.photoUrl ? (
                  <img
                    src={req.userId.photoUrl}
                    alt="Profile"
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mr-4">
                    <span className="text-xl text-white">
                      {req.userId.firstName[0]}
                      {req.userId.lastName[0]}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold mb-1 truncate">
                    {req.userId.firstName} {req.userId.lastName}
                  </h3>
                  <p className="text-sm text-gray-400 truncate">
                    {req.userId.emailId}
                  </p>
                </div>
              </div>
              <div className="flex-grow">
                <p className="text-sm text-gray-300 mb-2 truncate">
                  <strong>Project:</strong> {req.projectTitle}
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Message:</strong> {req.message || "No message provided."}
                </p>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Role:</strong> {req.role || "Not specified"}
                </p>
                <p className="text-sm text-gray-300 mb-4">
                  <strong>Requested On:</strong>{" "}
                  {dayjs(req.createdAt).format("MMM D, YYYY")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="py-1 px-3 bg-green-600 hover:bg-green-500 text-white rounded-md transition flex-1"
                  onClick={() =>
                    handleRequestAction(req.projectId, req._id, "accept")
                  }
                >
                  Accept
                </button>
                <button
                  className="py-1 px-3 bg-red-600 hover:bg-red-500 text-white rounded-md transition flex-1"
                  onClick={() =>
                    handleRequestAction(req.projectId, req._id, "reject")
                  }
                >
                  Reject
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
