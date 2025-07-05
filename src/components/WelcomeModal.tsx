import React from "react";
import "../styles/WelcomeModal.css";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  userName = "there",
}) => {
  if (!isOpen) return null;

  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        <div className="welcome-content">
          <div className="welcome-icon">🎉</div>
          <h2>Welcome to Vivid, {userName.split(" ")[0]}!</h2>
          <p className="welcome-message">
            Thanks for joining Vivid! We're excited to help you create
            beautiful, engaging essays.
          </p>

          <div className="credit-gift">
            <div className="credit-info">
              <h3>You've received 1 free credit!</h3>
              <p>
                Use it to transform your first essay into a vivid visual
                experience.
              </p>
            </div>
          </div>

          <button className="get-started-btn" onClick={onClose}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
