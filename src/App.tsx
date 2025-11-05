import { Routes, Route } from "react-router-dom";
import { HomePage } from "./Page/HomePage";
import ChatPage from "./Page/ChatPage";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat-assistant" element={<ChatPage />} />
      </Routes>
    </div>
  );
}

export default App;
