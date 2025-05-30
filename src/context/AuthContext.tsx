import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../firebase";

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  credits: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserCredits: (credits: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const AUTO_LOGOUT_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const LOGIN_TIMESTAMP_KEY = 'vivid_loginTimestamp';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutTimer, setLogoutTimer] = useState<NodeJS.Timeout | null>(null);

  // Function to clear the logout timer
  const clearLogoutTimer = () => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
  };

  // Function to set up the auto logout timer
  const setupAutoLogout = () => {
    clearLogoutTimer(); // Clear any existing timer
    const timer = setTimeout(() => {
      logout();
    }, AUTO_LOGOUT_TIME);
    setLogoutTimer(timer);
    
    // Store login timestamp
    localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
  };

  // Function to check if login has expired
  const checkLoginExpiration = () => {
    const loginTimestamp = localStorage.getItem(LOGIN_TIMESTAMP_KEY);
    if (loginTimestamp) {
      const loginTime = parseInt(loginTimestamp);
      const currentTime = Date.now();
      if (currentTime - loginTime >= AUTO_LOGOUT_TIME) {
        // Login has expired, log out
        logout();
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    // Check login expiration on mount
    if (checkLoginExpiration()) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Send user data to backend
          const response = await axios.post(
            `${API_URL}/auth/firebase-login`,
            {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            }
          );

          // Save JWT token from our backend
          localStorage.setItem("auth_token", response.data.token);

          // Set user data
          setUser(response.data.user);
          
          // Set up auto logout timer
          setupAutoLogout();
        } catch (err) {
          console.error("Error authenticating with backend:", err);
          setError("Failed to authenticate with server");
        }
      } else {
        // User is signed out
        localStorage.removeItem("auth_token");
        localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
        setUser(null);
        clearLogoutTimer();
      }
      setLoading(false);
    });

    // Set up interval to check login expiration
    const expirationCheckInterval = setInterval(() => {
      if (checkLoginExpiration()) {
        clearInterval(expirationCheckInterval);
      }
    }, 1000); // Check every second

    // Cleanup subscription, timer, and interval
    return () => {
      unsubscribe();
      clearLogoutTimer();
      clearInterval(expirationCheckInterval);
    };
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();

      // Set custom parameters for the Google provider
      provider.setCustomParameters({
        prompt: "select_account",
      });

      // Firebase doesn't directly support positioning the popup,
      // but we can use CSS to center it when it appears
      // Add a global style for the Google auth popup
      const style = document.createElement("style");
      style.id = "google-popup-style";
      style.innerHTML = `
        .firebaseui-card-content, .firebaseui-container, .mdl-card {
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          position: fixed !important;
        }
      `;
      document.head.appendChild(style);

      const result = await signInWithPopup(auth, provider);

      // Remove the style after popup is closed
      const styleElement = document.getElementById("google-popup-style");
      if (styleElement) document.head.removeChild(styleElement);

      // The sign-in was successful
      console.log("Google sign-in successful");
    } catch (err) {
      // Remove the style if there was an error
      const styleElement = document.getElementById("google-popup-style");
      if (styleElement) document.head.removeChild(styleElement);

      console.error("Error during Google sign-in:", err);
      setError("Failed to sign in with Google");
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("auth_token");
      localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
      setUser(null);
      clearLogoutTimer();

      // Also notify backend about logout
      await axios.post(`${API_URL}/auth/logout`);
    } catch (err) {
      console.error("Error during logout:", err);
      // Still remove token and user data on client side
      localStorage.removeItem("auth_token");
      localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
      setUser(null);
      clearLogoutTimer();
    }
  };

  // Function to update user credits
  const updateUserCredits = (credits: number) => {
    if (user) {
      setUser({
        ...user,
        credits
      });
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    updateUserCredits
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
