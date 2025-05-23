import React, { useState, useEffect } from "react";
import ImageSelectionModal from "./ImageSelectionModal";
import "../styles/ImageSelectionFlow.css";

interface Section {
  section_number: number;
  content: string;
  background_image: string;
  selected_image_url?: string;
}

interface ImageSelectionFlowProps {
  sections: Section[];
  backgroundSuggestions: Record<string, string>;
  onImagesSelected: (selectedImages: Record<string, string>) => void;
  onClose: () => void;
}

const ImageSelectionFlow: React.FC<ImageSelectionFlowProps> = ({
  sections,
  backgroundSuggestions,
  onImagesSelected,
  onClose,
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState<Record<string, string>>({});
  const [allSectionImages, setAllSectionImages] = useState<Record<number, string[]>>({});
  const [loadingSections, setLoadingSections] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadingSectionRetry, setLoadingSectionRetry] = useState<boolean>(false);
  const [queuedSections, setQueuedSections] = useState<number[]>([]);

  const currentSection = sections[currentSectionIndex];
  const sectionKey = `section_${currentSection?.section_number}_background_image`;

  // Initialize queue with all section numbers
  useEffect(() => {
    if (sections.length > 0) {
      const sectionNumbers = sections.map(section => section.section_number);
      setQueuedSections(sectionNumbers);
    }
  }, [sections]);

  // Process the queue of sections
  useEffect(() => {
    const processNextSection = async () => {
      if (queuedSections.length === 0) return;

      const nextSectionNumber = queuedSections[0];
      const nextSection = sections.find(s => s.section_number === nextSectionNumber);
      
      if (nextSection && !allSectionImages[nextSectionNumber] && !loadingSections[nextSectionNumber]) {
        await loadImagesForSection(nextSection);
        setQueuedSections(prev => prev.slice(1));
      }
    };

    processNextSection();
  }, [queuedSections, sections, allSectionImages, loadingSections]);

  const loadImagesForSection = async (section: Section) => {
    if (!section?.background_image || loadingSections[section.section_number]) {
      return;
    }

    setLoadingSections(prev => ({
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
          sectionId: section.section_number,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch images for section ${section.section_number}`);
      }

      const data = await response.json();

      if (data.success && data.urls && data.urls.length > 0) {
        setAllSectionImages(prev => ({
          ...prev,
          [section.section_number]: data.urls,
        }));
      } else {
        setAllSectionImages(prev => ({
          ...prev,
          [section.section_number]: [],
        }));
      }
    } catch (err) {
      console.error(`Error loading images for section ${section.section_number}:`, err);
      setAllSectionImages(prev => ({
        ...prev,
        [section.section_number]: [],
      }));
    } finally {
      setLoadingSections(prev => ({
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
        setAllSectionImages(prev => ({
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
    setSelectedImages(prev => ({
      ...prev,
      [sectionKey]: imageUrl,
    }));

    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      const updatedSelectedImages = {
        ...selectedImages,
        [sectionKey]: imageUrl,
      };
      onImagesSelected(updatedSelectedImages);
      onClose();
    }
  };

  const handleSkipSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      onImagesSelected(selectedImages);
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
    <ImageSelectionModal
      isOpen={sections.length > 0}
      onClose={onClose}
      section={currentSection}
      images={currentImages}
      onSelectImage={handleSelectImage}
      onRetryLoad={handleRetryLoadImagesForCurrentSection}
    />
  );
};

export default ImageSelectionFlow;
