import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser } from "../utils/userSlice";
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/login`,
        { emailId, password },
        { withCredentials: true }
      );
      dispatch(addUser({ ...res.data, token: res.data.token }));
      navigate("/feed");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  const handleShowLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutAndShowForm = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      setShowLogoutModal(false);
    } catch (err) {
      console.error("Logout Failed:", err);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
    navigate("/feed");
  };

  if (user) {
    if (!showLogoutModal) {
      handleShowLogoutModal();
    }

    return (
      <div className="flex items-center justify-center bg-base-200">
        {showLogoutModal && (
          <div className="bg-neutral text-neutral-content p-6 rounded shadow-lg w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">You are already logged in.</h2>
            <p className="mb-4">Logout and log in with another account?</p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-error"
                onClick={handleLogoutAndShowForm}
              >
                Logout &amp; Continue
              </button>
              <button
                className="btn btn-outline"
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

  return (
    <div className=" flex items-center justify-center bg-base-200 text-white">
      <div className="card w-full max-w-md bg-neutral shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center text-primary text-3xl mb-4">Login</h2>
          <label className="label">
            <span className="label-text text-white">Email Address</span>
          </label>
          <input
            type="email"
            value={emailId}
            placeholder="Enter your email"
            className="input input-bordered w-full bg-base-100 text-white mb-4"
            onChange={(e) => setEmailId(e.target.value)}
          />
          <label className="label">
            <span className="label-text text-white">Password</span>
          </label>
          <input
            type="password"
            value={password}
            placeholder="Enter your password"
            className="input input-bordered w-full bg-base-100 text-white"
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-error text-center mt-2">{error}</p>}
          <div className="card-actions justify-center mt-6">
            <button className="btn btn-primary w-full" onClick={handleLogin}>
              Login
            </button>
          </div>
          <p className="text-center mt-4">
            Don&rsquo;t have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
