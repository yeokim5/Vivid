import React, { useState, useEffect } from "react";
import FullScreenModal from "./FullScreenModal";
import ImageCarousel from "./ImageCarousel";
import "../styles/ImageSelectionFlow.css";

interface Section {
  section_number: number;
  content: string;
  background_image: string;
  selected_image_url?: string;
}

interface ImageSelectionFlowProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  title: string;
  onComplete: (selectedImages: Record<string, string>) => void;
}

const ImageSelectionFlow: React.FC<ImageSelectionFlowProps> = ({
  isOpen,
  onClose,
  sections,
  title,
  onComplete,
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState<Record<string, string>>(
    {}
  );
  const [allSectionImages, setAllSectionImages] = useState<
    Record<number, string[]>
  >({});
  const [loadingSections, setLoadingSections] = useState<
    Record<number, boolean>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [loadingSectionRetry, setLoadingSectionRetry] =
    useState<boolean>(false);

  const currentSection = sections[currentSectionIndex];
  const sectionKey = `section_${currentSection?.section_number}_background_image`;

  // Load current section and preload next section when component mounts or section changes
  useEffect(() => {
    if (isOpen && sections.length > 0) {
      // Load current section if not already loaded
      if (currentSection && !allSectionImages[currentSection.section_number]) {
        loadImagesForSection(currentSection);
      }

      // Preload next section if it exists
      const nextSectionIndex = currentSectionIndex + 1;
      if (nextSectionIndex < sections.length) {
        const nextSection = sections[nextSectionIndex];
        if (!allSectionImages[nextSection.section_number]) {
          loadImagesForSection(nextSection);
        }
      }
    }
  }, [isOpen, currentSectionIndex, sections]);

  const loadImagesForSection = async (section: Section) => {
    if (!section?.background_image || loadingSections[section.section_number]) {
      return;
    }

    // Mark this section as loading
    setLoadingSections((prev) => ({
      ...prev,
      [section.section_number]: true,
    }));

    try {
      const response = await fetch("http://localhost:5000/api/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: section.background_image,
          maxImages: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch images for section ${section.section_number}`
        );
      }

      const data = await response.json();

      if (data.success && data.urls && data.urls.length > 0) {
        setAllSectionImages((prev) => ({
          ...prev,
          [section.section_number]: data.urls,
        }));
      } else {
        // Set empty array if no images were found
        setAllSectionImages((prev) => ({
          ...prev,
          [section.section_number]: [],
        }));
      }
    } catch (err) {
      console.error(
        `Error loading images for section ${section.section_number}:`,
        err
      );
      // Set empty array on error
      setAllSectionImages((prev) => ({
        ...prev,
        [section.section_number]: [],
      }));
    } finally {
      // Mark this section as no longer loading
      setLoadingSections((prev) => ({
        ...prev,
        [section.section_number]: false,
      }));
    }
  };

  const handleRetryLoadImagesForCurrentSection = async () => {
    if (!currentSection?.background_image) return;

    setLoadingSectionRetry(true);

    try {
      const response = await fetch("http://localhost:5000/api/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentSection.background_image,
          maxImages: 10,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();

      if (data.success && data.urls && data.urls.length > 0) {
        setAllSectionImages((prev) => ({
          ...prev,
          [currentSection.section_number]: data.urls,
        }));
      }
    } catch (err) {
      console.error("Error retrying image load:", err);
    } finally {
      setLoadingSectionRetry(false);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    setSelectedImages((prev) => ({
      ...prev,
      [sectionKey]: imageUrl,
    }));

    // Move to next section or complete
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      // We're done with all sections
      const updatedSelectedImages = {
        ...selectedImages,
        [sectionKey]: imageUrl,
      };
      onComplete(updatedSelectedImages);
      onClose();
    }
  };

  const handleSkipSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      onComplete(selectedImages);
      onClose();
    }
  };

  const progress = ((currentSectionIndex + 1) / sections.length) * 100;

  // Get images for the current section
  const currentImages =
    currentSection && allSectionImages[currentSection.section_number]
      ? allSectionImages[currentSection.section_number]
      : [];

  // Check if current section is still loading
  const isCurrentSectionLoading =
    currentSection && loadingSections[currentSection.section_number];

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Select Images for "${title}"`}
    >
      <div className="image-selection-flow">
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <div className="progress-text">
            Section {currentSectionIndex + 1} of {sections.length}
          </div>
        </div>

        <div className="section-content">
          <h3>Section {currentSection?.section_number}</h3>
          <p>{currentSection?.content}</p>
        </div>

        {error ? (
          <div className="error">{error}</div>
        ) : isCurrentSectionLoading || loadingSectionRetry ? (
          <div className="loading">Loading images...</div>
        ) : (
          <ImageCarousel
            images={currentImages}
            onSelectImage={handleSelectImage}
            prompt={currentSection?.background_image || ""}
            onRetryLoad={handleRetryLoadImagesForCurrentSection}
          />
        )}

        <div className="navigation-buttons">
          <button className="skip-button" onClick={handleSkipSection}>
            Skip This Section
          </button>

          {currentSectionIndex === sections.length - 1 && (
            <div className="completion-message">
              <p>
                After selecting an image for this section (or skipping), your
                essay will be exported as a JSON file with the content and
                selected images.
              </p>
            </div>
          )}
        </div>
      </div>
    </FullScreenModal>
  );
};

export default ImageSelectionFlow;
