import { BrowserRouter, Routes, Route } from "react-router-dom"; // Fix import!
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import FeedPage from "./components/FeedPage";
import ErrorPage from "./components/ErrorPage";

export default function App() {
  return (
    <Provider store={appStore}>
      {" "}
      {/* ✅ Pass store as a prop */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Body />}>
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<FeedPage />} />{" "}
            <Route path="/error" element={<ErrorPage></ErrorPage>}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
