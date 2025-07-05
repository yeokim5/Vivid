import React from "react";
import FullScreenModal from "./FullScreenModal";
import "../styles/ProcessingModal.css";

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title="Creating Your Vivid Essay"
    >
      <div className="processing-modal">
        <div className="processing-content">
          <div className="processing-icon">
            <div className="spinner">⚡</div>
          </div>
          <h2>
            Your essay is being transformed into a beautiful visual experience!
          </h2>
          <p className="processing-description">
            Please wait while we create your immersive essay with stunning
            visuals...
          </p>
          <div className="processing-steps">
            <div className="step active">
              <div className="step-icon">📝</div>
              <span>Analyzing content</span>
            </div>
            <div className="step active">
              <div className="step-icon">🎨</div>
              <span>Selecting images</span>
            </div>
            <div className="step processing">
              <div className="step-icon">✨</div>
              <span>Creating experience</span>
            </div>
          </div>
        </div>
      </div>
    </FullScreenModal>
  );
};

export default ProcessingModal;
