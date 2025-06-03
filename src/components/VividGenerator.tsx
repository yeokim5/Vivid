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
  onYoutubeUrlChange,
}) => {
  const { isAuthenticated, login, user, updateUserCredits } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SectionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBackgroundImages, setSelectedBackgroundImages] = useState<
    Record<string, string>
  >({});
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
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);

      return match && match[2].length === 11 ? match[2] : "";
    } catch (error) {
      console.error("Error extracting YouTube video code:", error);
      return "";
    }
  };

  const handleMakeVivid = async () => {
    if (!isAuthenticated || !user) {
      setError("Please sign in to use the Make it Vivid feature");
      return;
    }
    if (user.credits <= 0) {
      setError("You don't have enough credits to use this feature");
      return;
    }
    if (!validateInput()) {
      return;
    }
    setIsLoading(true);
    try {
      // Step 1: Divide into sections
      const response = await fetch(`${API_URL}/sections/divide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Server error: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      if (!(data.success && data.data)) {
        throw new Error(data.message || "Invalid response from server");
      }
      setResult(data.data);
      // Step 2: For each section, fetch one image automatically
      const sectionImageMap: Record<string, string> = {};
      for (const section of data.data.sections) {
        try {
          const imgRes = await fetch(`${API_URL}/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: section.background_image,
              maxImages: 1,
              sectionId: `section_${section.section_number}_background_image`,
            }),
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            if (imgData.success && imgData.urls && imgData.urls.length > 0) {
              sectionImageMap[
                `section_${section.section_number}_background_image`
              ] = imgData.urls[0];
            }
          }
        } catch (e) {
          // If image fetch fails, skip (leave blank)
        }
      }
      setSelectedBackgroundImages(sectionImageMap);
      // Step 3: Immediately create the essay
      const updatedSections = data.data.sections.map((section: any) => {
        const sectionKey = `section_${section.section_number}_background_image`;
        const selectedImageUrl = sectionImageMap[sectionKey];
        return {
          ...section,
          selected_image_url: selectedImageUrl || "",
        };
      });
      const updatedResult = {
        ...data.data,
        sections: updatedSections,
      };
      setResult(updatedResult);
      // Create essay
      const authToken = localStorage.getItem("auth_token");
      if (!authToken)
        throw new Error("Not authenticated. Please log in to create an essay.");
      const youtubeVideoCode = extractYoutubeVideoCode(youtubeUrl);
      const essayRes = await fetch(`${API_URL}/essays/html`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: updatedResult.title,
          subtitle: updatedResult.subtitle,
          header_background_image:
            updatedResult.header_background_image_url || "",
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
            header_background_image:
              updatedResult.header_background_image_url || "",
            sections: updatedResult.sections.map((section: any) => ({
              section_number: section.section_number,
              content: section.content,
              selected_image_url: section.selected_image_url || "",
            })),
          },
        }),
      });
      if (!essayRes.ok) {
        const errorData = await essayRes.json().catch(() => null);
        throw new Error(
          errorData?.error ||
            `Server error: ${essayRes.status} ${essayRes.statusText}`
        );
      }
      const essayData: EssayJsonResponse = await essayRes.json();
      if (essayData.success && essayData.essayId) {
        // Deduct credit only after successful essay creation
        const creditResponse = await fetch(`${API_URL}/credits/use`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (creditResponse.ok) {
          const creditData = await creditResponse.json();
          if (creditData.success) {
            updateUserCredits(creditData.credits);
          }
        }
        setEssayCreated(true);
        setEssayViewUrl(`/essay/${essayData.essayId}`);
        setShowSuccessModal(true);
      } else {
        throw new Error(essayData.message || "Failed to create essay");
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
