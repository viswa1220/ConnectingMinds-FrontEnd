import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser, removeUser } from "../utils/userSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useState, useEffect } from "react";
import { persistStore } from "redux-persist";
import appStore from "../utils/appStore"; // Import Redux store

const persistor = persistStore(appStore);

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
    } catch (err) {
      dispatch(removeUser());

      // 🚀 If the user is not logged in, prevent re-fetching
      if (err.response && err.response.status === 401) {
        sessionStorage.clear();
        localStorage.clear();
        persistor.purge(); // ✅ Ensure Redux persist is reset
        navigate("/login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // ✅ Logout function with full cleanup
  const logout = async () => {
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });

      // Remove Redux user data
      dispatch(removeUser());

      // ✅ Clear persisted storage
      persistor.purge();
      sessionStorage.clear();
      localStorage.clear();

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
