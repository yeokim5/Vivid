import React, { ReactNode, useEffect } from "react";
import ModalPortal from "./ModalPortal";
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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup function to always reset overflow when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Additional cleanup on unmount to ensure scroll is never locked
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="full-screen-modal">
        <div className="modal-header">
          {title && <h2>{title}</h2>}
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </ModalPortal>
  );
};

export default FullScreenModal;
