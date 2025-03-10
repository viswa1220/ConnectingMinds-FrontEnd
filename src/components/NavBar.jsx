import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { removeUser } from "../utils/userSlice";
import {
  FaUser,
  FaProjectDiagram,
  FaSignOutAlt,
  FaTasks,
} from "react-icons/fa";
import { BsPersonCheckFill } from "react-icons/bs";
import { RiTeamFill } from "react-icons/ri";
import {
  FiUserCheck,
  FiUserMinus,
  FiUserPlus,
  FiSettings,
} from "react-icons/fi";
import { useState } from "react";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State management for dropdowns
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isHovered, setIsHovered] = useState(null);

  const handleLogout = async () => {
    try {
      await axios.post(
        BASE_URL + "/logout",
        {},
        {
          withCredentials: true,
        }
      );
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.log("Logout Failed: " + err);
    }
  };

  // Handles dropdown visibility
  const handleDropdownToggle = (name) => {
    setDropdownOpen((prev) => (prev === name ? null : name));
  };

  const handleMouseEnter = (name) => {
    setIsHovered(name);
  };

  const handleMouseLeave = () => {
    setIsHovered(null);
  };

  return (
    <div className="sticky top-0 z-50">
      <div className="navbar bg-base-300 text-white shadow-lg">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-2xl font-bold tracking-wide">
            Connecting Minds
          </Link>
          {user && (
            <span className="ml-4 text-lg">
              Welcome, {user.firstName}!
            </span>
          )}
        </div>

        <div className="flex-none gap-4 flex items-center">
          {user && (
            <>
              {/* Projects Dropdown */}
              <div
                className="relative inline-block"
                onMouseEnter={() => handleMouseEnter("projects")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => handleDropdownToggle("projects")}
                  className="btn btn-ghost flex items-center gap-2"
                >
                  <FaProjectDiagram className="text-2xl text-primary" />
                  <span className="hidden md:inline">Projects</span>
                </button>
                {(dropdownOpen === "projects" || isHovered === "projects") && (
                  <div className="absolute left-0 mt-2 w-52 bg-base-200 rounded-md shadow-lg z-50">
                    <ul className="menu p-2">
                      <li>
                        <Link to="/my-projects" className="flex items-center">
                          <FaTasks className="mr-2 text-success" />
                          My Projects
                        </Link>
                      </li>
                      <li>
                        <Link to="/join-requests" className="flex items-center">
                          <FiUserPlus className="mr-2 text-info" />
                          Join Requests
                        </Link>
                      </li>
                      <li>
                        <Link to="/my-working-projects" className="flex items-center">
                          <RiTeamFill className="mr-2 text-secondary" />
                          My Working Projects
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Connections Dropdown */}
              <div
                className="relative inline-block"
                onMouseEnter={() => handleMouseEnter("connections")}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => handleDropdownToggle("connections")}
                  className="btn btn-ghost flex items-center gap-2"
                >
                  <RiTeamFill className="text-2xl text-secondary" />
                  <span className="hidden md:inline">Connections</span>
                </button>
                {(dropdownOpen === "connections" || isHovered === "connections") && (
                  <div className="absolute left-0 mt-2 w-52 bg-base-200 rounded-md shadow-lg z-50">
                    <ul className="menu p-2">
                      <li>
                        <Link to="/my-connections" className="flex items-center">
                          <BsPersonCheckFill className="mr-2 text-success" />
                          My Connections
                        </Link>
                      </li>
                      <li>
                        <Link to="/received-requests" className="flex items-center">
                          <FiUserCheck className="mr-2 text-info" />
                          Received Requests
                        </Link>
                      </li>
                      <li>
                        <Link to="/sent-requests" className="flex items-center">
                          <FiUserMinus className="mr-2 text-warning" />
                          Sent Requests
                        </Link>
                      </li>
                      <li>
                        <Link to="/people/feed" className="flex items-center">
                          <FiUserPlus className="mr-2 text-primary" />
                          Similar Interests
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {/* User Profile and Settings */}
          {user && (
            <div className="dropdown dropdown-end mx-5 relative z-50">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar transition-transform hover:scale-105"
              >
                <div className="w-10 rounded-full">
                  <img alt="user photo" src={user.photoUrl} />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-200 rounded-box z-50 mt-3 w-52 p-2 shadow"
              >
                <li>
                  <Link to="/profile" className="flex items-center">
                    <FaUser className="mr-2" />
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="flex items-center">
                    <FiSettings className="mr-2" />
                    Settings
                  </Link>
                </li>
                <li>
                  <a onClick={handleLogout} className="flex items-center cursor-pointer">
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
