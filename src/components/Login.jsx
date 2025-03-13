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

  // ✅ Handle Login
  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${BASE_URL}/login`,
        { emailId, password },
        { withCredentials: true }
      );

      dispatch(addUser({ ...res.data.user, token: res.data.token }));
      navigate("/feed");
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-8 text-white">
      <div className="card w-full max-w-md bg-neutral shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-center text-primary text-3xl mb-4">
            Login
          </h2>
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
            <button
              className="btn btn-primary w-full"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Login"
              )}
            </button>
          </div>
          <p className="text-center mt-4">
            Don’t have an account?{" "}
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
