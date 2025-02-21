import { BrowserRouter, Routes, Route } from "react-router-dom"; // Fix import!
import Login from "./components/Login";
import Profile from "./components/Profile";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import NavBar from "./components/NavBar";
import FeedPage from "./components/FeedPage";

export default function App() {
  return (
    <Provider store={appStore}>
      {" "}
      {/* ✅ Pass store as a prop */}
      <BrowserRouter>
        <NavBar></NavBar>
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
