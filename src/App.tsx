import { Routes, Route } from "react-router-dom";
// import { HomePage } from "./Page/HomePage";
import ChatPage from "./Page/ChatPage";
import { FinalPage } from "./Page/FinalPage";
import LoginPage from "./Page/LoginPage";
import RegisterPage from "./Page/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./Page/NotfoundPage";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/chat-assistant" element={<ChatPage />} />
          <Route path="/final" element={<FinalPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
