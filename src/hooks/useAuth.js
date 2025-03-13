import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser, removeUser } from "../utils/userSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useState, useEffect } from "react";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user session on mount
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
    } catch {
      dispatch(removeUser());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      document.cookie = "token=; Max-Age=0; path=/; domain=.thoughtsunite.com";
      sessionStorage.clear(); // ✅ Ensure session storage is cleared
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout Failed: ", err);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, logout };
};

export default useAuth;
