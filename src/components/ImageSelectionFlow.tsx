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
  const [currentSectionIndex, setCurrentSectionIndex] = useState(-1); // Start at -1 for header
  const [selectedImages, setSelectedImages] = useState<Record<string, string>>({});
  const [allSectionImages, setAllSectionImages] = useState<Record<string, string[]>>({});
  const [loadingSections, setLoadingSections] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadingSectionRetry, setLoadingSectionRetry] = useState<boolean>(false);
  const [queuedSections, setQueuedSections] = useState<string[]>([]);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  // Cleanup function to call backend cleanup endpoint
  const cleanup = async () => {
    // Call backend cleanup endpoint
    try {
      await fetch(`${API_URL}/images/cleanup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionId: currentSectionIndex === -1 ? 'header_background_image' : `section_${sections[currentSectionIndex]?.section_number}_background_image`
        })
      });
    } catch (err) {
      console.error("Error cleaning up backend:", err);
    }
  };

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);  // Remove dependencies, only run on unmount

  // Initialize queue with header and all section numbers
  useEffect(() => {
    if (sections.length > 0) {
      const sectionKeys = ['header_background_image', ...sections.map(section => `section_${section.section_number}_background_image`)];
      setQueuedSections(sectionKeys);
    }
  }, [sections]);

  // Process the queue of sections
  useEffect(() => {
    const processNextSection = async () => {
      if (queuedSections.length === 0) return;

      const nextKey = queuedSections[0];
      const isHeader = nextKey === 'header_background_image';
      const nextSection = isHeader ? null : sections.find(s => `section_${s.section_number}_background_image` === nextKey);
      
      if ((isHeader || nextSection) && !allSectionImages[nextKey] && !loadingSections[nextKey]) {
        await loadImagesForSection(nextKey, isHeader ? backgroundSuggestions.header_background_image : nextSection?.background_image);
        setQueuedSections(prev => prev.slice(1));
      }
    };

    processNextSection();
  }, [queuedSections, sections, allSectionImages, loadingSections, backgroundSuggestions]);

  const loadImagesForSection = async (key: string, prompt: string | undefined) => {
    if (!prompt || loadingSections[key]) {
      return;
    }

    setLoadingSections(prev => ({
      ...prev,
      [key]: true,
    }));

    try {
      const response = await fetch(`${API_URL}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          maxImages: 10,
          sectionId: key,
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch images for ${key}`);
      }

      const data = await response.json();

      if (data.success && data.urls && data.urls.length > 0) {
        setAllSectionImages(prev => ({
          ...prev,
          [key]: data.urls,
        }));
      } else {
        setAllSectionImages(prev => ({
          ...prev,
          [key]: [],
        }));
      }
    } catch (err: unknown) {
      console.error(`Error loading images for ${key}:`, err);
      setAllSectionImages(prev => ({
        ...prev,
        [key]: [],
      }));
    } finally {
      setLoadingSections(prev => ({
        ...prev,
        [key]: false,
      }));
    }
  };

  const handleRetryLoadImagesForCurrentSection = async () => {
    const currentKey = currentSectionIndex === -1 ? 'header_background_image' : `section_${sections[currentSectionIndex]?.section_number}_background_image`;
    const prompt = currentSectionIndex === -1 ? backgroundSuggestions.header_background_image : sections[currentSectionIndex]?.background_image;
    
    if (!prompt) return;

    setLoadingSectionRetry(true);

    try {
      const response = await fetch(`${API_URL}/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          maxImages: 10,
        })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }

      const data = await response.json();

      if (data.success && data.urls && data.urls.length > 0) {
        setAllSectionImages(prev => ({
          ...prev,
          [currentKey]: data.urls,
        }));
      }
    } catch (err: unknown) {
      console.error("Error retrying image load:", err);
    } finally {
      setLoadingSectionRetry(false);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    const currentKey = currentSectionIndex === -1 ? 'header_background_image' : `section_${sections[currentSectionIndex]?.section_number}_background_image`;
    
    // Create a new state with the current selection
    const newSelectedImages = {
      ...selectedImages,
      [currentKey]: imageUrl
    };

    // Update the state
    setSelectedImages(newSelectedImages);

    if (currentSectionIndex < sections.length - 1) {
      // Simply move to the next section
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      // Pass the new state directly instead of using the state variable
      onImagesSelected(newSelectedImages);
      onClose();
    }
  };

  const handleSkipSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      // Simply move to the next section
      setCurrentSectionIndex(currentSectionIndex + 1);
    } else {
      onImagesSelected(selectedImages);
      onClose();
    }
  };

  const progress = ((currentSectionIndex + 2) / (sections.length + 1)) * 100;

  // Get images for the current section
  const currentKey = currentSectionIndex === -1 ? 'header_background_image' : `section_${sections[currentSectionIndex]?.section_number}_background_image`;
  const currentImages = allSectionImages[currentKey] || [];

  // Check if current section is still loading
  const isCurrentSectionLoading = loadingSections[currentKey];

  // Handle modal close
  const handleClose = () => {
    cleanup();  // Call cleanup when user closes the modal
    onClose();
  };

  return (
    <ImageSelectionModal
      isOpen={sections.length > 0}
      onClose={handleClose}
      section={currentSectionIndex === -1 ? {
        section_number: 0,
        content: "Choose Background For Title Section",
        background_image: backgroundSuggestions.header_background_image
      } : sections[currentSectionIndex]}
      images={currentImages}
      onSelectImage={handleSelectImage}
      onRetryLoad={handleRetryLoadImagesForCurrentSection}
    />
  );
};

export default ImageSelectionFlow;
