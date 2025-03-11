import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useEffect } from "react";
import NavBar from "./NavBar";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((store) => store.user);

  const fetchUser = async () => {
    if (userData) return;
    try {
      const res = await axios.get(`${BASE_URL}/profile/view`, {
        withCredentials: true,
      });
      dispatch(addUser(res.data));
    } catch (err) {
      if (err.status === 401) {
        navigate("/login");
      }
      console.log("error", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

 
  const hideFooter = ["/login", "/signup"].some(
    (path) => location.pathname.startsWith(path)
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
