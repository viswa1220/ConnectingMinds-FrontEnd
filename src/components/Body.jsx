import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect, useState } from "react";
import NavBar from "./NavBar";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    // If we already have user data, stop loading
    if (userData) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${BASE_URL}/profile/view`, {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
      setLoading(false);
    } catch (err) {
      // Check for a 401 error from the server
      if (err.response && err.response.status === 401) {
        navigate("/login");
      } else {
        console.log("error", err);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While loading, you could return a spinner or similar
  if (loading) {
    return <div>Loading...</div>;
  }

  // Optionally hide the footer on specific pages
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
