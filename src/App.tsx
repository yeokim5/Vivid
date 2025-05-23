import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Profile from "./pages/Profile";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import ViewEssay from "./pages/ViewEssay";
import Essays from "./pages/Essays";

// Placeholder components - would be imported from actual components
const AboutPage: React.FC = () => <div>About Page</div>;

const App: React.FC = () => {
  const location = useLocation();
  const isEssayView = location.pathname.startsWith('/essay/') || location.pathname.startsWith('/essays/');

  return (
    <AuthProvider>
      <div className="App">
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/essays" element={<Essays />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/essay/:id" element={<ViewEssay />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isEssayView && (
          <footer>
            <p>&copy; {new Date().getFullYear()} MagicEssay</p>
          </footer>
        )}
      </div>
    </AuthProvider>
  );
};

export default App;
