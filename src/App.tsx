import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import ViewEssay from "./pages/ViewEssay";
import Essays from "./pages/Essays";
import UserEssays from "./pages/UserEssays";
import "./styles/App.css";

const App: React.FC = () => {
  const location = useLocation();
  const isEssayView = location.pathname.startsWith('/essay/') || location.pathname.startsWith('/essays/');

  return (
    <AuthProvider>
      <div className="App">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/essays" element={<Essays />} />
          <Route path="/my-essays" element={<UserEssays />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/essay/:id" element={<ViewEssay />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isEssayView && (
          <footer>
            <p>&copy; {new Date().getFullYear()} Vivid</p>
          </footer>
        )}
      </div>
    </AuthProvider>
  );
};

export default App;
