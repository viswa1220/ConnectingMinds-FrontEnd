import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [emailId, setEmailId] = useState("example@example.com");
  const [password, setPassword] = useState("MyPassword@123");
  const [error, setError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        BASE_URL + "/login",
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser(res.data));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data || "something went wrong");
    }
  };

  const handleShowLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutAndShowForm = async () => {
    // Perform logout
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      setShowLogoutModal(false);
    } catch (err) {
      console.error("Logout Failed:", err);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
    navigate("/"); // or any other route you want to keep them on
  };

  // ✅ If user is already logged in, show a modal or prompt
  if (user) {
    // If we haven't shown the modal yet, do so
    if (!showLogoutModal) {
      handleShowLogoutModal();
    }

    // Render the modal
    return (
      <div className="flex justify-center items-center min-h-screen">
        {showLogoutModal && (
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">You are already logged in.</h2>
            <p className="mb-4">Do you want to logout and log in with another account?</p>
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleLogoutAndShowForm}
              >
                Logout & Continue
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                onClick={handleCancelLogout}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ✅ If user is NOT logged in, show normal login form
  return (
    <div className="flex justify-center">
      <div className="card bg-base-200 w-96 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Login</h2>
          <div>
            {/* Email */}
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Enter Email Address :</span>
              </div>
              <input
                type="text"
                value={emailId}
                placeholder="Type Email here"
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setEmailId(e.target.value)}
              />
            </label>

            {/* Password */}
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Enter Password :</span>
              </div>
              <input
                type="password"
                value={password}
                placeholder="Type Password here"
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>
          <p className="text-red-500">{error}</p>
          <div className="card-actions justify-center">
            <button className="btn btn-primary" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
