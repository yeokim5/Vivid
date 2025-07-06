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
  syncUserFromToken: (token?: string) => Promise<boolean>;
  showWelcomeModal: boolean;
  setShowWelcomeModal: (show: boolean) => void;
  notification: {
    message: string;
    type: "login" | "logout";
    isVisible: boolean;
  } | null;
  clearNotification: () => void;
  showNotification: (message: string, type: "login" | "logout") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const AUTO_LOGOUT_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const LOGIN_TIMESTAMP_KEY = "vivid_loginTimestamp";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutTimer, setLogoutTimer] = useState<NodeJS.Timeout | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "login" | "logout";
    isVisible: boolean;
  } | null>(null);

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

    // Function to restore user from existing token
    const restoreUserFromToken = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          // Verify token with backend and get current user
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Set user data from token
          setUser(response.data);
          // console.log("User restored from token:", response.data);

          // We no longer show notification on token restoration
          // This ensures the welcome message only appears on explicit login

          setupAutoLogout();
          return true;
        } catch (err) {
          // console.error("Error restoring user from token:", err);
          // Token is invalid, remove it
          localStorage.removeItem("auth_token");
          localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
          setUser(null); // Explicitly set user to null
          return false;
        }
      }
      return false;
    };

    // Try to restore user from token first
    const initializeAuth = async () => {
      // console.log("Initializing authentication...");
      const tokenRestored = await restoreUserFromToken();
      // console.log("Token restored:", tokenRestored);

      // Set up Firebase auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        // console.log("Firebase auth state changed:", !!firebaseUser);
        if (firebaseUser) {
          // Always check if we need to authenticate with backend
          if (!tokenRestored || !user) {
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

              // Show welcome modal if this is a new user
              if (response.data.isNewUser) {
                setShowWelcomeModal(true);
              } else {
                // Only show login notification for explicit login actions (not token restoration)
                // We only want to show this when the user actually clicks the login button
                // not when their token is automatically restored
                const isExplicitLogin =
                  sessionStorage.getItem("explicit_login_in_progress") ===
                  "true";
                if (isExplicitLogin) {
                  showNotification(
                    `Welcome back, ${response.data.user.name || "User"}!`,
                    "login"
                  );
                  // Clear the flag
                  sessionStorage.removeItem("explicit_login_in_progress");
                }
              }

              // Set up auto logout timer
              setupAutoLogout();

              // console.log(
              //   "User authenticated and state updated:",
              //   response.data.user
              // );
            } catch (err) {
              // console.error("Error authenticating with backend:", err);
              setError("Failed to authenticate with server");
            }
          }
        } else {
          // User is signed out from Firebase, clear everything
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
    };

    const cleanup = initializeAuth();
    return () => {
      cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
    };
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      // Set a flag to indicate this is an explicit login action
      sessionStorage.setItem("explicit_login_in_progress", "true");

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
      // console.log(
      //   "Google sign-in successful, waiting for auth state update..."
      // );

      // Don't set loading to false here - let the onAuthStateChanged handler do it
      // This ensures the UI stays in loading state until the user data is fully loaded
    } catch (err) {
      // Remove the style if there was an error
      const styleElement = document.getElementById("google-popup-style");
      if (styleElement) document.head.removeChild(styleElement);

      // console.error("Error during Google sign-in:", err);
      setError("Failed to sign in with Google");
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Get user name before clearing
      const userName = user?.name || "User";

      await signOut(auth);
      localStorage.removeItem("auth_token");
      localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
      sessionStorage.removeItem("lastLoginNotification"); // Clear notification flag
      setUser(null);
      clearLogoutTimer();

      // Show logout notification
      showNotification(`Goodbye, ${userName}!`, "logout");

      // Also notify backend about logout
      await axios.post(`${API_URL}/auth/logout`);
    } catch (err) {
      // console.error("Error during logout:", err);
      // Get user name before clearing (for error case)
      const userName = user?.name || "User";

      // Still remove token and user data on client side
      localStorage.removeItem("auth_token");
      localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
      sessionStorage.removeItem("lastLoginNotification"); // Clear notification flag
      setUser(null);
      clearLogoutTimer();

      // Show logout notification even if backend call fails
      showNotification(`Goodbye, ${userName}!`, "logout");
    }
  };

  // Function to update user credits
  const updateUserCredits = (credits: number) => {
    if (user) {
      setUser({
        ...user,
        credits,
      });
    }
  };

  // Function to manually sync user state (useful for AuthCallback)
  const syncUserFromToken = async (token?: string) => {
    const authToken = token || localStorage.getItem("auth_token");
    if (authToken) {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        setUser(response.data);
        setupAutoLogout();
        setLoading(false);
        return true;
      } catch (err) {
        // console.error("Error syncing user from token:", err);
        localStorage.removeItem("auth_token");
        localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
        setUser(null);
        setLoading(false);
        return false;
      }
    }
    setLoading(false);
    return false;
  };

  // Function to clear notification
  const clearNotification = () => {
    setNotification(null);
  };

  // Function to show notification
  const showNotification = (message: string, type: "login" | "logout") => {
    setNotification({
      message,
      type,
      isVisible: true,
    });
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    updateUserCredits,
    syncUserFromToken,
    showWelcomeModal,
    setShowWelcomeModal,
    notification,
    clearNotification,
    showNotification,
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
