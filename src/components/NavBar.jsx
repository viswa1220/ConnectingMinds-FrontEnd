import React, { useState } from "react";
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
  FaBars,
} from "react-icons/fa";
import { RiTeamFill } from "react-icons/ri";
import {
  FiUserCheck,
  FiUserMinus,
  FiUserPlus,
} from "react-icons/fi";

const NavBar = () => {
  const reduxUser = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error("Logout Failed:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const toggleDropdown = (name) => {
    setDropdownOpen((prev) => (prev === name ? null : name));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setDropdownOpen(null);
  };

  const closeDropdown = () => {
    setDropdownOpen(null);
  };

  return (
    <div
      className="sticky top-0 z-50 relative"
      style={{
        borderTop: "10px solid #8F8AC3",
        borderLeft: "10px solid #8F8AC3",
        borderRight: "10px solid #8F8AC3",
      }}
    >
      {/* Desktop Layout */}
      <div className="hidden md:flex flex-col">
        {/* Main Navbar */}
        <div className="navbar bg-white text-[#4B4896] shadow-lg h-24 flex flex-wrap">
          <div className="flex-1 flex items-center justify-between px-4">
            {/* Logo & Welcome */}
            <div className="flex items-center space-x-4">
              <Link to="/feed" className="flex items-center">
                <img
                  src="/ConnectingMinds.png"
                  alt="Connecting Minds Logo"
                  className="h-16 w-auto object-contain"
                />
              </Link>
              {reduxUser && (
                <span className="hidden md:inline">
                  Welcome, {reduxUser.firstName}!
                </span>
              )}
            </div>
          </div>
          {/* Nav Links */}
          <div className="flex items-center gap-4 px-4 pb-2">
            {reduxUser && (
              <>
                {/* Projects Dropdown */}
                <div className="relative inline-block">
                  <button
                    onClick={() => toggleDropdown("projects")}
                    className="btn btn-ghost flex items-center gap-2 transition-colors hover:text-purple-600"
                  >
                    <FaProjectDiagram className="text-xl" />
                    <span>Projects</span>
                  </button>
                  {dropdownOpen === "projects" && (
                    <div className="absolute left-0 mt-2 w-52 bg-gray-100 text-[#4B4896] rounded-md shadow-lg z-50">
                      <ul className="menu p-2">
                        <li>
                          <Link to="/my-projects" onClick={closeDropdown}>
                            <FaTasks className="mr-2" />
                            Owned Projects
                          </Link>
                        </li>
                        <li>
                          <Link to="/join-requests" onClick={closeDropdown}>
                            <FiUserPlus className="mr-2" />
                            Project Join Requests
                          </Link>
                        </li>
                        <li>
                          <Link to="/my-working-projects" onClick={closeDropdown}>
                            <RiTeamFill className="mr-2" />
                            Joined Projects
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Connections Dropdown */}
                <div className="relative inline-block">
                  <button
                    onClick={() => toggleDropdown("connections")}
                    className="btn btn-ghost flex items-center gap-2 transition-colors hover:text-purple-600"
                  >
                    <RiTeamFill className="text-xl" />
                    <span>Connections</span>
                  </button>
                  {dropdownOpen === "connections" && (
                    <div className="absolute left-0 mt-2 w-52 bg-gray-100 text-[#4B4896] rounded-md shadow-lg z-50">
                      <ul className="menu p-2">
                        <li>
                          <Link to="/my-connections" onClick={closeDropdown}>
                            <FiUserCheck className="mr-2" />
                            My Connections
                          </Link>
                        </li>
                        <li>
                          <Link to="/received-requests" onClick={closeDropdown}>
                            <FiUserPlus className="mr-2" />
                            Incoming Requests
                          </Link>
                        </li>
                        <li>
                          <Link to="/sent-requests" onClick={closeDropdown}>
                            <FiUserMinus className="mr-2" />
                            Outgoing Requests
                          </Link>
                        </li>
                        <li>
                          <Link to="/people/feed" onClick={closeDropdown}>
                            <FiUserPlus className="mr-2" />
                            Discover People
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative inline-block">
                  <button
                    onClick={() => toggleDropdown("profile")}
                    className="btn btn-ghost flex items-center gap-2 transition-colors hover:text-purple-600"
                  >
                    <FaUser className="text-xl" />
                    <span>Profile</span>
                  </button>
                  {dropdownOpen === "profile" && (
                    <div className="absolute left-0 mt-2 w-52 bg-gray-100 text-[#4B4896] rounded-md shadow-lg z-50">
                      <ul className="menu p-2">
                        <li>
                          <Link to="/profile" onClick={closeDropdown}>
                            Profile
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="flex items-center"
                          >
                            {loggingOut ? (
                              <span className="loading loading-spinner"></span>
                            ) : (
                              <>
                                <FaSignOutAlt className="mr-2" />
                                Logout
                              </>
                            )}
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
  {/* Mobile Navbar */}
  <div className="flex flex-col bg-white text-[#4B4896] shadow-lg">
    {/* Row 1: Logo & Menu Toggle */}
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
      <Link to="/feed" className="flex items-center">
        <img
          src="/ConnectingMinds.png"
          alt="Connecting Minds Logo"
          className="h-16 w-auto object-contain"
        />
      </Link>
      <button
        className="btn btn-ghost"
        onClick={toggleMobileMenu}
        aria-label="Toggle Mobile Menu"
      >
        <FaBars className="text-2xl" />
      </button>
    </div>

    {/* Row 2: Mobile Nav Links */}
    <div
      className={`${
        isMobileMenuOpen ? "block" : "hidden"
      } transition-all duration-300`}
    >
      {reduxUser && (
        <div className="px-4 py-2 space-y-3">
          {/* Projects */}
          <div className="border-b border-gray-200 pb-2">
            <button
              onClick={() => toggleDropdown("projects")}
              className="w-full text-left font-semibold flex items-center gap-2"
            >
              <FaProjectDiagram className="text-xl" />
              <span>Projects</span>
            </button>
            {dropdownOpen === "projects" && (
              <ul className="pl-4 mt-1 space-y-1">
                <li>
                  <Link
                    to="/my-projects"
                    onClick={closeDropdown}
                    className="flex items-center gap-2"
                  >
                    <FaTasks className="text-lg" />
                    Owned Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to="/join-requests"
                    onClick={closeDropdown}
                    className="flex items-center gap-2"
                  >
                    <FiUserPlus className="text-lg" />
                    Project Join Requests
                  </Link>
                </li>
                <li>
                  <Link
                    to="/my-working-projects"
                    onClick={closeDropdown}
                    className="flex items-center gap-2"
                  >
                    <RiTeamFill className="text-lg" />
                    Joined Projects
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Connections */}
          <div className="border-b border-gray-200 pb-2">
            <button
              onClick={() => toggleDropdown("connections")}
              className="w-full text-left font-semibold flex items-center gap-2"
            >
              <RiTeamFill className="text-xl" />
              <span>Connections</span>
            </button>
            {dropdownOpen === "connections" && (
              <ul className="pl-4 mt-1 space-y-1">
                <li>
                  <Link
                    to="/my-connections"
                    onClick={closeDropdown}
                    className="flex items-center gap-2"
                  >
                    <FiUserCheck className="text-lg" />
                    My Connections
                  </Link>
                </li>
                <li>
                  <Link
                    to="/received-requests"
                    onClick={closeDropdown}
                    className="flex items-center gap-2"
                  >
                    <FiUserPlus className="text-lg" />
                    Incoming Requests
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sent-requests"
                    onClick={closeDropdown}
                    className="flex items-center gap-2"
                  >
                    <FiUserMinus className="text-lg" />
                    Outgoing Requests
                  </Link>
                </li>
                <li>
                  <Link
                    to="/people/feed"
                    onClick={closeDropdown}
                    className="flex items-center gap-2"
                  >
                    <FiUserPlus className="text-lg" />
                    Discover People
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Profile */}
          <div className="border-b border-gray-200 pb-2">
            <button
              onClick={() => toggleDropdown("profile")}
              className="w-full text-left font-semibold flex items-center gap-2"
            >
              <FaUser className="text-xl" />
              <span>Profile</span>
            </button>
            {dropdownOpen === "profile" && (
              <ul className="pl-4 mt-1 space-y-1">
                <li>
                  <Link
                    to="/profile"
                    onClick={closeDropdown}
                    className="flex items-center gap-2"
                  >
                    <FaUser className="text-lg" />
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2"
                  >
                    {loggingOut ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <>
                        <FaSignOutAlt className="text-lg" />
                        Logout
                      </>
                    )}
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
</div>
    </div>
  );
};

export default NavBar;