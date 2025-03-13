import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser } from "../utils/userSlice";
import { useEffect, useState } from "react";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user only if not removed from Redux
  const fetchUser = async () => {
    if (!userData) {
      setLoading(false);
      return; // 🔥 Stop fetching if user is already removed
    }

    try {
      const res = await axios.get(`${BASE_URL}/profile/view`, {
        withCredentials: true,
      });

      if (res.data && res.data._id) {
        dispatch(addUser(res.data)); // ✅ Add user if valid response
      } else {
        dispatch(removeUser()); // ✅ Ensure user is fully removed
      }

      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) {
        dispatch(removeUser()); // ✅ Remove user on unauthorized
        navigate("/login");
      } else {
        console.log("Fetch user error:", err);
      }
      setLoading(false);
    }
  };

  // ✅ Ensure user data updates properly
  useEffect(() => {
    if (userData === null) {
      setLoading(false);
    } else {
      fetchUser();
    }
  }, [userData]); // ✅ Runs when Redux user changes

  // ✅ Show loading state until user data is ready
  if (loading) {
    return <div className="text-center text-gray-400">Loading...</div>;
  }

  // ✅ Hide the footer on specific routes
  const hideFooter = ["/login", "/signup"].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <div>
      <div className="container mx-auto p-4">
        <NavBar />
        <Outlet />
      </div>
      {!hideFooter && (
        <div className="mt-4">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Body;
