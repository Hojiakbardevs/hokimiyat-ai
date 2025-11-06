import { Routes, Route } from "react-router-dom";
import { HomePage } from "./Page/HomePage";
import ChatPage from "./Page/ChatPage";
import { GeneratePage } from "./Page/GeneratePage";
import { FinalPage } from "./Page/FinalPage";
import { DocumentViewPage } from "./Page/DocumentViewPage";
import NotFound from "./Page/NotfoundPage";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat-assistant" element={<ChatPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/document-view" element={<DocumentViewPage />} />
        <Route path="/final" element={<FinalPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
