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

  // Function to fetch and refresh the user data
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/profile/view`, {
        withCredentials: true,
      });
      if (res.data && res.data._id) {
        dispatch(addUser(res.data));
      } else {
        dispatch(removeUser());
      }
    } catch (err) {
      if (err.response?.status === 401) {
        dispatch(removeUser());
        navigate("/login");
      } else {
        console.log("Fetch user error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [userData, location.pathname, navigate]);

  if (loading) {
    return <div className="text-center text-gray-400">Loading...</div>;
  }

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
        <div className="mt-2 mx-auto p-4">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default Body;