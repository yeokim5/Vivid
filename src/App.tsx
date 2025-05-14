import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthContext";

// Placeholder components - would be imported from actual components
const About: React.FC = () => <div>About Page</div>;
const NotFound: React.FC = () => <div>404 - Page Not Found</div>;

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <footer>
          <p>&copy; {new Date().getFullYear()} MagicEssay</p>
        </footer>
      </div>
    </AuthProvider>
  );
};

export default App;
