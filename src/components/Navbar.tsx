import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import { useAuth } from "../context/AuthContext";
import PurchaseCreditsModal from "./PurchaseCreditsModal";
import ModalPortal from "./ModalPortal";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();

  // Debounced scroll handler for better performance
  useEffect(() => {
    let scrollTimer: number | null = null;
    
    const handleScroll = () => {
      if (scrollTimer !== null) {
        window.cancelAnimationFrame(scrollTimer);
      }
      
      scrollTimer = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimer !== null) {
        window.cancelAnimationFrame(scrollTimer);
      }
    };
  }, []);

  // Use memoized toggle handler
  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
    
    // Prevent body scrolling when menu is open
    if (!menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  }, []);

  const handleAuthAction = useCallback(() => {
    if (isAuthenticated) {
      logout();
    } else {
      login();
    }
  }, [isAuthenticated, login, logout]);

  const handleLogout = useCallback(() => {
    logout();
    setShowLogoutMenu(false);
  }, [logout]);

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" style={{fontFamily: "Ariel"}}>
            Vivid
          </Link>

          <div
            className={`menu-icon ${menuOpen ? "active" : ""}`}
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
            <li className="nav-item">
              <Link
                to="/essays"
                className="nav-link"
                onClick={closeMenu}
              >
                Explore
              </Link>
            </li>
            <li className="nav-item">
              {isAuthenticated ? (
                <div className="profile-container">
                  <button
                    className="nav-link profile-nav-link"
                    onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                  >
                    Profile
                  </button>
                  {showLogoutMenu && (
                    <div className="logout-menu">
                      <div className="profile-menu-item credits-display">
                        Credits: {user?.credits || 0}
                        <button 
                          className="buy-credits-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowLogoutMenu(false);
                            setShowPurchaseModal(true);
                          }}
                        >
                          Buy Credits
                        </button>
                      </div>
                      <Link 
                        to="/my-essays" 
                        className="profile-menu-item"
                        onClick={() => setShowLogoutMenu(false)}
                      >
                        My Essays
                      </Link>
                      <button onClick={handleLogout} className="logout-button">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="nav-link nav-btn-google"
                  onClick={() => {
                    closeMenu();
                    handleAuthAction();
                  }}
                >
                  <div className="google-btn-content">
                    <img
                      src="https://developers.google.com/identity/images/g-logo.png"
                      alt="Google logo"
                      className="google-icon"
                    />
                    <span>Sign in with Google</span>
                  </div>
                </button>
              )}
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Purchase Credits Modal - rendered outside the navbar using Portal */}
      {showPurchaseModal && user && (
        <ModalPortal>
          <PurchaseCreditsModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            currentCredits={user.credits}
          />
        </ModalPortal>
      )}
    </>
  );
};

export default Navbar;
