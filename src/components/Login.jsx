import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${BASE_URL}/login`,
        { emailId, password },
        { withCredentials: true }
      );

      // ✅ Ensure payload matches the userSlice expectations
      dispatch(addUser({ user: res.data.user }));
      navigate("/feed");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#8F8AC3] text-white px-4">
      <div className="bg-white text-[#4B4896] shadow-lg rounded-lg w-full max-w-md p-6">
        {/* Login Title */}
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            value={emailId}
            placeholder="Enter your email"
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-[#4B4896]"
            onChange={(e) => setEmailId(e.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            placeholder="Enter your password"
            className="w-full p-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:border-[#4B4896]"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Login Button */}
        <button
          className="w-full py-2 bg-[#4B4896] text-white rounded-md hover:bg-[#3A3778] transition flex justify-center items-center"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Login"
          )}
        </button>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#4B4896] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
