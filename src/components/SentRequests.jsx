import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import {
  FiUserCheck,
  FiClock,
  FiXCircle,
  FiArrowLeft,
  FiStar,
  FiCode,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

const SentRequests = () => {
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending', 'accepted', 'rejected'

  const loggedInUser = useSelector((state) => state.user);
  const loggedInUserId = loggedInUser?._id;

  useEffect(() => {
    if (!loggedInUserId) return; // ✅ Fix: Condition inside useEffect

    const fetchSentRequests = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/people/requests`, {
          withCredentials: true,
        });
        console.log("All sent requests:", res.data.data);
        setSentRequests(res.data.data.filter(
          (req) => req.fromUserId._id.toString() === loggedInUserId.toString()
        ));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch sent requests.");
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
      <div className="min-h-screen text-center text-gray-400">
        No sent requests found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-4xl font-bold mb-8 text-center text-blue-400">
        Sent Requests
      </h2>
      <Link to="/feed" className="text-blue-400 mb-4 inline-flex items-center">
        <FiArrowLeft className="mr-2" /> Back to feed
      </Link>

      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-full transition ${
            activeTab === "pending"
              ? "bg-yellow-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setActiveTab("accepted")}
          className={`px-4 py-2 rounded-full transition ${
            activeTab === "accepted"
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Accepted
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-4 py-2 rounded-full transition ${
            activeTab === "rejected"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => {
            const user = request.toUserId;
            return (
              <div key={request._id} className="p-4 bg-gray-800 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <img
                    src={user.photoUrl || "https://via.placeholder.com/50"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full mr-3 object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-yellow-400">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Joined: {dayjs(user.createdAt).format("DD MMM YYYY")}
                    </p>
                  </div>
                </div>

                {/* Sent Date */}
                <p className="text-sm text-gray-400 mb-2">
                  Sent on: {dayjs(request.createdAt).format("DD MMM YYYY")}
                </p>

                {/* Status Badge */}
                {request.status === "pending" && (
                  <div className="mt-4 p-2 w-full bg-yellow-600 rounded-full text-center">
                    <FiClock className="inline-block mr-2" />
                    Pending
                  </div>
                )}
                {request.status === "accepted" && (
                  <div className="mt-4 p-2 w-full bg-green-600 rounded-full text-center">
                    <FiUserCheck className="inline-block mr-2" />
                    Connected
                  </div>
                )}
                {request.status === "rejected" && (
                  <div className="mt-4 p-2 w-full bg-red-600 rounded-full text-center">
                    <FiXCircle className="inline-block mr-2" />
                    Rejected
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 w-full col-span-3">
            No {activeTab} requests found.
          </div>
        )}
      </div>
    </div>
  );
};

export default SentRequests;
