import { BrowserRouter, Routes, Route } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/Login";
import Profile from "./components/Profile";
import { Provider } from "react-redux";
import appStore, { persistor } from "./utils/appStore";
import FeedPage from "./components/FeedPage";
import ErrorPage from "./components/ErrorPage";
import PeopleFeedPage from "./components/PeopleFeedPage";
import ProjectFeedPage from "./components/ProjectFeedPage";
import ChatPage from "./components/ChatRoom";
import MyProjects from "./components/MyProjects";
import MyWorkingProjects from "./components/MyWorkingProjects";
import JoinRequests from "./components/JoinRequests";
import TaskManagement from "./components/TaskManagement";
import UnconnectedPeopleFeed from "./components/UnconnectedPeopleFeed";
import SentRequests from "./components/SentRequests";
import MyConnections from "./components/MyConnections";
import ReceivedRequests from "./components/ReceivedRequests";
import CollaboratorsChat from "./components/CollaboratorsChat";
import CollabChatPage from "./components/CollabChatPage";
import SignUp from "./components/SignUp";
import { PersistGate } from "redux-persist/integration/react";

export default function App() {
  return (
    <Provider store={appStore}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Body />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/people-feed" element={<PeopleFeedPage />} />
              <Route path="/project-feed" element={<ProjectFeedPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/" element={<FeedPage />} />
              <Route path="/my-projects" element={<MyProjects />} />
              <Route
                path="/my-working-projects"
                element={<MyWorkingProjects />}
              />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/join-requests" element={<JoinRequests />} />
              <Route path="/chat/:projectId/:chatId" element={<ChatPage />} />
              <Route path="/people/feed" element={<UnconnectedPeopleFeed />} />
              <Route path="/sent-requests" element={<SentRequests />} />
              <Route path="/my-connections" element={<MyConnections />} />
              <Route path="/received-requests" element={<ReceivedRequests />} />
              <Route path="/chat/:projectId" element={<CollaboratorsChat />} />
              <Route
                path="/collab-chat/:projectId/:chatId"
                element={<CollabChatPage />}
              />
              <Route
                path="/projects/:projectId/tasks"
                element={<TaskManagement />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}
