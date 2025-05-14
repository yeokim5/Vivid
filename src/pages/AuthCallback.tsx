import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get token from URL query parameters
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error) {
      console.error("Authentication error:", error);
      navigate("/login?error=" + error);
      return;
    }

    if (token) {
      // Save token to localStorage
      localStorage.setItem("auth_token", token);

      // Redirect to home page or dashboard
      navigate("/");
    } else {
      // No token found, redirect to login
      navigate("/login?error=no_token");
    }
  }, [location, navigate]);

  return (
    <div className="auth-callback">
      <div className="loading-spinner">
        <p>Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
