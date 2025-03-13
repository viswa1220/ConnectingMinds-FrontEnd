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
  FiSettings,
} from "react-icons/fi";
import { useState } from "react";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (err) {
      console.log("Logout Failed: ", err);
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
    <div className="sticky top-0 z-50">
  {/* Navbar with increased height */}
  <div className="navbar bg-base-300 text-white shadow-lg h-24 flex flex-wrap">
    {/* Left section: Brand Image + (optional) Welcome + Hamburger */}
    <div className="flex-1 flex items-center justify-between">
      <div className="flex items-center h-full">
        <Link to="/feed" className="btn btn-ghost h-full flex items-center">
          {/* Larger logo height */}
          <img
            src="/ConnectingMinds.png"
            alt="Connecting Minds Logo"
            className="h-20 w-32 object-contain"
          />
        </Link>
        {user && (
          <span className="ml-4 hidden md:inline">
            Welcome, {user.firstName}!
          </span>
        )}
      </div>
      <button className="btn btn-ghost md:hidden" onClick={toggleMobileMenu}>
        <FaBars className="text-2xl" />
      </button>
    </div>


        {/* Right section: nav links (desktop) or stacked (mobile) */}
        <div
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } md:flex md:items-center md:gap-4 w-full md:w-auto transition-all`}
        >
          {user && (
            <>
              {/* Projects Dropdown */}
              <div className="relative inline-block">
                <button
                  onClick={() => toggleDropdown("projects")}
                  className="btn btn-ghost flex items-center gap-2 w-full md:w-auto"
                >
                  <FaProjectDiagram className="text-2xl text-primary" />
                  <span>Projects</span>
                </button>
                {dropdownOpen === "projects" && (
                  <div className="absolute left-0 mt-2 w-52 bg-base-200 rounded-md shadow-lg z-50">
                    <ul className="menu p-2">
                      <li>
                        <Link to="/my-projects" onClick={closeDropdown}>
                          <FaTasks className="mr-2 text-success" />
                          Owned Projects
                        </Link>
                      </li>
                      <li>
                        <Link to="/join-requests" onClick={closeDropdown}>
                          <FiUserPlus className="mr-2 text-info" />
                          Project Join Requests
                        </Link>
                      </li>
                      <li>
                        <Link to="/my-working-projects" onClick={closeDropdown}>
                          <RiTeamFill className="mr-2 text-secondary" />
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
                  className="btn btn-ghost flex items-center gap-2 w-full md:w-auto"
                >
                  <RiTeamFill className="text-2xl text-secondary" />
                  <span>Connections</span>
                </button>
                {dropdownOpen === "connections" && (
                  <div className="absolute left-0 mt-2 w-52 bg-base-200 rounded-md shadow-lg z-50">
                    <ul className="menu p-2">
                      <li>
                        <Link to="/my-connections" onClick={closeDropdown}>
                          <FiUserCheck className="mr-2 text-success" />
                          My Connections
                        </Link>
                      </li>
                      <li>
                        <Link to="/received-requests" onClick={closeDropdown}>
                          <FiUserPlus className="mr-2 text-info" />
                          Incoming Connection Requests
                        </Link>
                      </li>
                      <li>
                        <Link to="/sent-requests" onClick={closeDropdown}>
                          <FiUserMinus className="mr-2 text-warning" />
                          Outgoing Connection Requests
                        </Link>
                      </li>
                      <li>
                        <Link to="/people/feed" onClick={closeDropdown}>
                          <FiUserPlus className="mr-2 text-primary" />
                          Discover People
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {user && (
            <div className="dropdown dropdown-end mx-5 relative">
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
                  <Link to="/profile">
                    <FaUser className="mr-2" />
                    Profile
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="flex items-center justify-start">
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
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
