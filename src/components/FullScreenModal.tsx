import React, { ReactNode } from "react";
import "../styles/FullScreenModal.css";

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div className="full-screen-modal">
      <div className="modal-header">
        {title && <h2>{title}</h2>}
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="modal-content">{children}</div>
    </div>
  );
};

export default FullScreenModal;
