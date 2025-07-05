import React, { useEffect, useState } from "react";
import "../styles/AuthNotification.css";

interface AuthNotificationProps {
  message: string;
  type: "login" | "logout";
  isVisible: boolean;
  onClose: () => void;
}

const AuthNotification: React.FC<AuthNotificationProps> = ({
  message,
  type,
  isVisible,
  onClose,
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Delay removal to allow fade-out animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`auth-notification ${type} ${
        isVisible ? "visible" : "hidden"
      }`}
    >
      <div className="notification-content">
        <div className="notification-icon">{type === "login" ? "✓" : "👋"}</div>
        <span className="notification-message">{message}</span>
        <button
          className="notification-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AuthNotification;
