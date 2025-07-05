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
  const [isMobile, setIsMobile] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();

  // Check if the device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 960);
      // If mobile, always show logout menu when authenticated
      if (window.innerWidth <= 960 && isAuthenticated) {
        setShowLogoutMenu(true);
      }
    };

    // Initial check
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [isAuthenticated]);

  // Debug: Log auth state changes
  useEffect(() => {
    // console.log("Navbar - Auth state changed:", {
    //   isAuthenticated,
    //   user: !!user,
    // });
  }, [isAuthenticated, user]);

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
    setMenuOpen((prev) => !prev);

    // Prevent body scrolling when menu is open
    if (!menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    document.body.style.overflow = "";
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
    setShowLogoutMenu(!isMobile); // Keep menu open on mobile after logout
  }, [logout, isMobile]);

  // Toggle profile menu only on desktop
  const toggleProfileMenu = useCallback(() => {
    if (!isMobile) {
      setShowLogoutMenu(!showLogoutMenu);
    }
  }, [showLogoutMenu, isMobile]);

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" style={{ fontFamily: "Ariel" }}>
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
              <Link to="/essays" className="nav-link" onClick={closeMenu}>
                Explore
              </Link>
            </li>
            <li className="nav-item">
              {isAuthenticated ? (
                <div className="profile-container">
                  <button
                    className="nav-link profile-nav-link"
                    onClick={toggleProfileMenu}
                  >
                    Profile
                  </button>
                  {(showLogoutMenu || isMobile) && (
                    <div className="logout-menu">
                      <div className="profile-menu-item credits-display">
                        Credits: {user?.credits || 0}
                        <button
                          className="buy-credits-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isMobile) setShowLogoutMenu(false);
                            setShowPurchaseModal(true);
                          }}
                        >
                          Buy Credits
                        </button>
                      </div>
                      <Link
                        to="/my-essays"
                        className="profile-menu-item"
                        onClick={() => {
                          if (!isMobile) setShowLogoutMenu(false);
                        }}
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
