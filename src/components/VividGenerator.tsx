import React, { useState } from "react";
import "../styles/VividGenerator.css";
import ImageSelectionFlow from "./ImageSelectionFlow";
import SuccessModal from "./SuccessModal";
import PurchaseCreditsModal from "./PurchaseCreditsModal";
import ModalPortal from "./ModalPortal";
import { useAuth } from "../context/AuthContext";

interface VividGeneratorProps {
  title: string;
  content: string;
  titleColor: string;
  textColor: string;
  fontFamily: string;
  boxBgColor: string;
  boxOpacity: number;
  backgroundEffect: string;
  isPrivate: boolean;
  youtubeUrl: string;
  onPrivacyChange: (isPrivate: boolean) => void;
  onYoutubeUrlChange: (url: string) => void;
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

const VividGenerator: React.FC<VividGeneratorProps> = ({ 
  title, 
  content, 
  titleColor = "#f8f9fa", 
  textColor = "#f8f9fa", 
  fontFamily = "Playfair Display",
  boxBgColor = "#585858",
  boxOpacity = 0.5,
  backgroundEffect = "none",
  isPrivate = false,
  youtubeUrl = "",
  onPrivacyChange,
  onYoutubeUrlChange
}) => {
  const { isAuthenticated, login, user, updateUserCredits } = useAuth();
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
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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
    if (!isAuthenticated || !user) {
      setError("Please sign in to use the Make it Vivid feature");
      return;
    }

    // Check if user has credits
    if (user.credits <= 0) {
      // Instead of showing the purchase modal directly, show an error with a Get Credits button
      setError("You don't have enough credits to use this feature");
      return;
    }

    // Validate input
    if (!validateInput()) {
      return;
    }

    setIsLoading(true);

    // Use a credit
    try {
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        throw new Error("Not authenticated. Please log in.");
      }

      const creditResponse = await fetch(`${API_URL}/credits/use`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        }
      });

      if (!creditResponse.ok) {
        const errorData = await creditResponse.json().catch(() => null);
        throw new Error(
          errorData?.message || `Credit error: ${creditResponse.status} ${creditResponse.statusText}`
        );
      }

      const creditData = await creditResponse.json();
      if (!creditData.success) {
        throw new Error(creditData.message || "Failed to use credit");
      }

      // Update user credits in context
      updateUserCredits(creditData.credits);

      // Continue with vivid generation
      const response = await fetch(
        `${API_URL}/sections/divide`,
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
              isPrivate,
              titleColor,
              textColor,
              fontFamily,
              boxBgColor,
              boxOpacity,
              backgroundEffect,
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
    if (isAuthenticated) {
      handleMakeVivid();
    } else {
      // If not authenticated, open login modal
      login();
    }
  };

  return (
    <div className="vivid-generator">
      <button
        className="analyze-btn vivid-button"
        onClick={handleButtonClick}
        disabled={isLoading}
      >
        <span className="btn-icon">✨</span>
        {isLoading ? "Processing..." : "Make it Vivid"}
      </button>

      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
          {error.includes("enough credits") && user && (
            <button 
              className="get-credits-btn"
              onClick={() => setShowPurchaseModal(true)}
            >
              Get Credits
            </button>
          )}
        </div>
      )}

      {showImageSelectionFlow && result && (
        <ImageSelectionFlow
          sections={result.sections}
          backgroundSuggestions={backgroundSuggestions}
          onImagesSelected={handleBackgroundImagesSelected}
          onClose={() => setShowImageSelectionFlow(false)}
        />
      )}

      {showSuccessModal && essayViewUrl && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          essayViewUrl={essayViewUrl}
        />
      )}
      
      {showPurchaseModal && user && (
        <ModalPortal>
          <PurchaseCreditsModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            currentCredits={user.credits}
          />
        </ModalPortal>
      )}
    </div>
  );
};

export default VividGenerator;
