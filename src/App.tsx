import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";

// Placeholder components - would be imported from actual components
const About: React.FC = () => <div>About Page</div>;
const NotFound: React.FC = () => <div>404 - Page Not Found</div>;

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer>
        <p>&copy; {new Date().getFullYear()} MagicEssay</p>
      </footer>
    </div>
  );
};

export default App;
