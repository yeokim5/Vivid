import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import ViewEssay from "./pages/ViewEssay";
import Essays from "./pages/Essays";
import UserEssays from "./pages/UserEssays";
import StripeProvider from "./components/StripeProvider";
import WelcomeModal from "./components/WelcomeModal";
import AuthNotification from "./components/AuthNotification";
import ModalPortal from "./components/ModalPortal";
import "./styles/App.css";

const AppContent: React.FC = () => {
  const location = useLocation();
  const {
    user,
    showWelcomeModal,
    setShowWelcomeModal,
    notification,
    clearNotification,
    showNotification,
  } = useAuth();
  const isEssayView =
    location.pathname.startsWith("/essay/") ||
    location.pathname.startsWith("/essays/");

  // Reset body overflow on route changes to prevent scroll lock issues
  useEffect(() => {
    document.body.style.overflow = "";
  }, [location.pathname]);

  return (
    <StripeProvider>
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

        {/* Welcome Modal for new users */}
        {showWelcomeModal && user && (
          <ModalPortal>
            <WelcomeModal
              isOpen={showWelcomeModal}
              onClose={() => {
                setShowWelcomeModal(false);
                // No longer show notification when closing the welcome modal
              }}
              userName={user.name}
            />
          </ModalPortal>
        )}

        {/* Auth Notification */}
        {notification && (
          <AuthNotification
            message={notification.message}
            type={notification.type}
            isVisible={notification.isVisible}
            onClose={clearNotification}
          />
        )}
      </div>
    </StripeProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
