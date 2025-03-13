import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser, removeUser } from "../utils/userSlice";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { waitForRehydration } from "../utils/appStore"; // ✅ Import this function

const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      await waitForRehydration(); 
      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });

        if (res.data && res.data._id) {
          dispatch(addUser(res.data));
        }
      } catch (err) {
        dispatch(removeUser());
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  return { user, loading };
};

export default useAuth;
