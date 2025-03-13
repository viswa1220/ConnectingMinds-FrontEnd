import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [emailId, setEmailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  // ✅ Improved check for auth state (prevents incorrect "Already Logged In" message)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        dispatch(addUser(res.data)); // Ensure Redux is updated
        setAlreadyLoggedIn(true);
      } catch (err) {
        setAlreadyLoggedIn(false); // If error (401 unauthorized), user is logged out
      }
    };

    if (location.pathname === "/logn") {
      checkAuthStatus();
    }
  }, [dispatch, location.pathname]);

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

  const handleGoToFeed = () => {
    navigate("/feed");
  };

  return (
    <div className="flex items-center justify-center mt-8 text-white">
      <div className="card w-full max-w-md bg-neutral shadow-xl">
        <div className="card-body">
          {alreadyLoggedIn ? (
            <>
              <h2 className="card-title text-center text-primary text-3xl mb-4">
                You are already logged in.
              </h2>
              <div className="card-actions justify-center mt-6">
                <button className="btn btn-primary w-full" onClick={handleGoToFeed}>
                  Go to Feed
                </button>
              </div>
            </>
          ) : (
            <>
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
              {error && (
                <p className="text-error text-center mt-2">{error}</p>
              )}
              <div className="card-actions justify-center mt-6">
                <button className="btn btn-primary w-full" onClick={handleLogin}>
                  Login
                </button>
              </div>
              <p className="text-center mt-4">
                Don’t have an account?{" "}
                <Link to="/signup" className="text-blue-400 hover:underline">
                  Sign Up
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
