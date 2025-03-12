import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import appStore from "./utils/appStore";
import Body from "./components/Body";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Profile from "./components/Profile";
import FeedPage from "./components/FeedPage";
import ErrorPage from "./components/ErrorPage";
import PeopleFeedPage from "./components/PeopleFeedPage";
import ProjectFeedPage from "./components/ProjectFeedPage";
import ChatPage from "./components/ChatRoom";
import MyProjects from "./components/MyProjects";
import MyWorkingProjects from "./components/MyWorkingProjects"; // ✅ Import MyWorkingProjects
import JoinRequests from "./components/JoinRequests";
import TaskManagement from "./components/TaskManagement";
import UnconnectedPeopleFeed from "./components/UnconnectedPeopleFeed";
import SentRequests from "./components/SentRequests";
import MyConnections from "./components/MyConnections";
import ReceivedRequests from "./components/ReceivedRequests";
import CollaboratorsChat from "./components/CollaboratorsChat";
import CollabChatPage from "./components/CollabChatPage";

function RequireAuth({ children }) {
  // Here we check if there's a valid user.
  // Adjust this if your logic for determining authentication is different.
  const user = useSelector((state) => state.user);
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Body />}>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route
              path="/people-feed"
              element={
                <RequireAuth>
                  <PeopleFeedPage />
                </RequireAuth>
              }
            />
            <Route
              path="/project-feed"
              element={
                <RequireAuth>
                  <ProjectFeedPage />
                </RequireAuth>
              }
            />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <FeedPage />
                </RequireAuth>
              }
            />
            <Route
              path="/my-projects"
              element={
                <RequireAuth>
                  <MyProjects />
                </RequireAuth>
              }
            />
            <Route
              path="/my-working-projects"
              element={
                <RequireAuth>
                  <MyWorkingProjects />
                </RequireAuth>
              }
            />
            <Route
              path="/chat"
              element={
                <RequireAuth>
                  <ChatPage />
                </RequireAuth>
              }
            />
            <Route
              path="/join-requests"
              element={
                <RequireAuth>
                  <JoinRequests />
                </RequireAuth>
              }
            />
            <Route
              path="/chat/:projectId/:chatId"
              element={
                <RequireAuth>
                  <ChatPage />
                </RequireAuth>
              }
            />
            <Route
              path="/people/feed"
              element={
                <RequireAuth>
                  <UnconnectedPeopleFeed />
                </RequireAuth>
              }
            />
            <Route
              path="/sent-requests"
              element={
                <RequireAuth>
                  <SentRequests />
                </RequireAuth>
              }
            />
            <Route
              path="/my-connections"
              element={
                <RequireAuth>
                  <MyConnections />
                </RequireAuth>
              }
            />
            <Route
              path="/received-requests"
              element={
                <RequireAuth>
                  <ReceivedRequests />
                </RequireAuth>
              }
            />
            <Route
              path="/chat/:projectId"
              element={
                <RequireAuth>
                  <CollaboratorsChat />
                </RequireAuth>
              }
            />
            <Route
              path="/collab-chat/:projectId/:chatId"
              element={
                <RequireAuth>
                  <CollabChatPage />
                </RequireAuth>
              }
            />
            <Route
              path="/projects/:projectId/tasks"
              element={
                <RequireAuth>
                  <TaskManagement />
                </RequireAuth>
              }
            />
            {/* Error or fallback route */}
            <Route path="/error" element={<ErrorPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
