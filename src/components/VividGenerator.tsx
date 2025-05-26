import React, { useState } from "react";
import "../styles/VividGenerator.css";
import ImageSelectionFlow from "./ImageSelectionFlow";
import SuccessModal from "./SuccessModal";
import { useAuth } from "../context/AuthContext";

interface VividGeneratorProps {
  title: string;
  content: string;
}

interface Section {
  section_number: number;
  content: string;
  background_image: string;
  selected_image_url?: string;
}

interface SectionData {
  title: string;
  subtitle: string;
  header_background_image: string;
  sections: Section[];
}

interface EssayJsonResponse {
  success: boolean;
  message: string;
  essayId: string;
  viewUrl: string;
}

const VividGenerator: React.FC<VividGeneratorProps> = ({ title, content }) => {
  const { isAuthenticated, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SectionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backgroundSuggestions, setBackgroundSuggestions] = useState<
    Record<string, string>
  >({});
  const [selectedBackgroundImages, setSelectedBackgroundImages] = useState<
    Record<string, string>
  >({});
  const [showImageSelectionFlow, setShowImageSelectionFlow] = useState(false);
  const [essayCreated, setEssayCreated] = useState(false);
  const [essayViewUrl, setEssayViewUrl] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");

  const validateInput = () => {
    if (!title.trim()) {
      setError("Please provide a title for your essay");
      return false;
    }

    if (!content.trim()) {
      setError("Please provide some content for your essay");
      return false;
    }

    // Check if content is too short
    const words = content.trim().split(/\s+/);
    if (words.length < 50) {
      setError(
        "Your essay is too short. Please provide at least 50 words for better results."
      );
      return false;
    }

    return true;
  };

  const extractYoutubeVideoCode = (url: string): string => {
    if (!url) return "";
    
    try {
      // Handle different YouTube URL formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      return (match && match[2].length === 11) ? match[2] : "";
    } catch (error) {
      console.error("Error extracting YouTube video code:", error);
      return "";
    }
  };

  const handleMakeVivid = async () => {
    // Clear previous errors
    setError(null);

    // Check if user is authenticated
    if (!isAuthenticated) {
      setError("Please sign in to use the Make it Vivid feature");
      return;
    }

    // Validate input
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/sections/divide",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, content }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success && data.data) {
        // Extract background image suggestions from the sections
        const suggestions: Record<string, string> = {
          header_background_image: data.data.header_background_image
        };
        data.data.sections.forEach((section: Section, index: number) => {
          const sectionNumber = index + 1;
          suggestions[`section_${sectionNumber}_background_image`] =
            section.background_image;
        });

        setBackgroundSuggestions(suggestions);
        setResult(data.data);

        // Open the image selection flow
        setShowImageSelectionFlow(true);
      } else {
        throw new Error(data.message || "Invalid response from server");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error in Vivid Generator:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackgroundImagesSelected = async (
    selectedImages: Record<string, string>
  ) => {
    setSelectedBackgroundImages(selectedImages);

    // Update the sections with the selected images
    if (result) {
      const updatedSections = result.sections.map((section) => {
        const sectionKey = `section_${section.section_number}_background_image`;
        const selectedImageUrl = selectedImages[sectionKey];

        if (selectedImageUrl && selectedImageUrl.startsWith('http')) {
          return {
            ...section,
            selected_image_url: selectedImageUrl,
          };
        }
        return section;
      });

      const updatedResult = {
        ...result,
        sections: updatedSections,
      };

      setResult(updatedResult);

      try {
        // Get the auth token from localStorage
        const authToken = localStorage.getItem("auth_token");
        if (!authToken) {
          throw new Error("Not authenticated. Please log in to create an essay.");
        }

        // Extract YouTube video code if URL is provided
        const youtubeVideoCode = extractYoutubeVideoCode(youtubeUrl);

        // Create the essay with HTML content
        const response = await fetch(
          "http://localhost:5000/api/essays/html",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
              title: updatedResult.title,
              subtitle: updatedResult.subtitle,
              header_background_image: selectedImages.header_background_image?.startsWith('http') ? selectedImages.header_background_image : '',
              youtubeVideoCode,
              content: {
                title: updatedResult.title,
                subtitle: updatedResult.subtitle,
                header_background_image: selectedImages.header_background_image?.startsWith('http') ? selectedImages.header_background_image : '',
                sections: updatedResult.sections.map(section => ({
                  section_number: section.section_number,
                  content: section.content,
                  selected_image_url: section.selected_image_url?.startsWith('http') ? section.selected_image_url : ''
                }))
              }
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.error ||
              `Server error: ${response.status} ${response.statusText}`
          );
        }

        const data: EssayJsonResponse = await response.json();
        console.log("Essay creation response:", data);

        if (data.success && data.essayId) {
          setEssayCreated(true);
          setEssayViewUrl(`/essay/${data.essayId}`);
          setShowSuccessModal(true);
          setShowImageSelectionFlow(false); // Close the image selection flow
        } else {
          throw new Error(data.message || "Failed to create essay");
        }
      } catch (err) {
        console.error("Error creating essay:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create essay"
        );
        setShowImageSelectionFlow(false);
      }
    }
  };

  const handleCloseImageSelectionFlow = () => {
    setShowImageSelectionFlow(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleButtonClick = async () => {
    if (!isAuthenticated) {
      await login();
      return;
    }
    handleMakeVivid();
  };

  return (
    <div className="vivid-generator">
      <div className="youtube-input-section">
        <input
          type="text"
          className="youtube-url-input"
          placeholder="(Optional) Paste YouTube video URL for background music"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
      </div>

      <button
        className="analyze-btn"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        <span className="btn-icon">✨</span>
        {isLoading ? "Processing..." : "Make it Vivid"}
      </button>

      {error && <div className="error-message">{error}</div>}

      {showImageSelectionFlow && (
        <ImageSelectionFlow
          sections={result?.sections || []}
          backgroundSuggestions={backgroundSuggestions}
          onImagesSelected={handleBackgroundImagesSelected}
          onClose={handleCloseImageSelectionFlow}
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          essayViewUrl={essayViewUrl || ""}
          onClose={handleCloseSuccessModal}
        />
      )}
    </div>
  );
};

export default VividGenerator;
