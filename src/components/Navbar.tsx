import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
    } else {
      login();
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutMenu(false);
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
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
              onClick={() => setMenuOpen(false)}
            >
              Explore
            </Link>
          </li>
          <li className="nav-item">
            {isAuthenticated ? (
              <div className="profile-container">
                <button
                  className="nav-link nav-btn-secondary"
                  onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                >
                  Profile
                </button>
                {showLogoutMenu && (
                  <div className="logout-menu">
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
                  setMenuOpen(false);
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
  );
};

export default Navbar;
