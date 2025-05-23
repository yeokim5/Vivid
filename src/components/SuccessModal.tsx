import React from "react";
import FullScreenModal from "./FullScreenModal";
import "../styles/SuccessModal.css";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  essayViewUrl: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  essayViewUrl,
}) => {
  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Essay Created Successfully!">
      <div className="success-modal">
        <div className="success-content">
          <div className="success-icon">✨</div>
          <h2>Your essay has been transformed into a beautiful visual experience!</h2>
          <a
            href={essayViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="view-essay-btn"
          >
            View Your Essay
          </a>
        </div>
      </div>
    </FullScreenModal>
  );
};

export default SuccessModal; 