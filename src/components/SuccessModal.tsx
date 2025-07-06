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
  const handleViewEssay = () => {
    // Open in a new tab
    window.open(essayViewUrl, "_blank");
  };

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title="Essay Created Successfully!"
    >
      <div className="success-modal">
        <div className="success-content">
          <div className="success-icon">✨</div>
          <h2>
            Your essay has been transformed into a beautiful visual experience!
          </h2>
          <button onClick={handleViewEssay} className="view-essay-btn">
            View Your Essay
          </button>
        </div>
      </div>
    </FullScreenModal>
  );
};

export default SuccessModal;
