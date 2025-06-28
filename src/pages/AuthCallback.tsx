import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { syncUserFromToken } = useAuth();

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

      // Sync user state with the AuthContext
      syncUserFromToken(token).then((success) => {
        if (success) {
          // Redirect to home page after successful sync
          navigate("/");
        } else {
          // Token was invalid, redirect to login
          navigate("/login?error=invalid_token");
        }
      });
    } else {
      // No token found, redirect to login
      navigate("/login?error=no_token");
    }
  }, [location, navigate, syncUserFromToken]);

  return (
    <div className="auth-callback">
      <div className="loading-spinner">
        <p>Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
