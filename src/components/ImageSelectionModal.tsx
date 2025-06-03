// DEPRECATED: This component is no longer used in the new auto-selection flow. All image selection is now automatic and handled in VividGenerator.tsx.
import React from "react";
import FullScreenModal from "./FullScreenModal";
import ImageCarousel from "./ImageCarousel";
import "../styles/ImageSelectionModal.css";

interface Section {
  section_number: number;
  content: string;
  background_image: string;
  selected_image_url?: string;
}

interface ImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section;
  images: string[];
  onSelectImage: (imageUrl: string) => void;
  onRetryLoad?: () => void;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
  isOpen,
  onClose,
  section,
  images,
  onSelectImage,
  onRetryLoad,
}) => {
  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        section.section_number === 0
          ? "Select Header Background Image"
          : `Select Image for Section ${section.section_number}`
      }
    >
      <div className="image-selection-modal">
        <div className="section-content">
          <h3>
            {section.section_number === 0
              ? "Title Background"
              : `Section ${section.section_number}`}
          </h3>
          <p>{section.content}</p>
        </div>

        <div className="image-selection-content">
          <ImageCarousel
            key={section.section_number}
            images={images}
            onSelectImage={onSelectImage}
            prompt={section.background_image}
            onRetryLoad={onRetryLoad}
          />
        </div>
      </div>
    </FullScreenModal>
  );
};

export default ImageSelectionModal;
