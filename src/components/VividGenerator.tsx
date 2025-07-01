import React, { useState } from "react";
import "../styles/VividGenerator.css";
import ImageSelectionFlow from "./ImageSelectionFlow";
import SuccessModal from "./SuccessModal";
import PurchaseCreditsModal from "./PurchaseCreditsModal";
import ModalPortal from "./ModalPortal";
import QueueModal from "./QueueModal";
import { useAuth } from "../context/AuthContext";
import { createApiUrl, getAuthHeaders, API_CONFIG } from "../config/api";
import { DEFAULT_STYLES } from "../constants/styles";

type HeadersInit = Record<string, string> | Headers;

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
  titleColor = DEFAULT_STYLES.titleColor,
  textColor = DEFAULT_STYLES.textColor,
  fontFamily = DEFAULT_STYLES.fontFamily,
  boxBgColor = DEFAULT_STYLES.boxBgColor,
  boxOpacity = DEFAULT_STYLES.boxOpacity,
  backgroundEffect = DEFAULT_STYLES.backgroundEffect,
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
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [queueItemId, setQueueItemId] = useState<string | null>(null);

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

  const processEssay = async () => {
    try {
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error("Not authenticated. Please log in to create an essay.");
      }

      // Step 1: Divide into sections
      const response = await fetch(
        createApiUrl(API_CONFIG.ENDPOINTS.SECTIONS.DIVIDE),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
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
      if (!(data.success && data.data)) {
        throw new Error(data.message || "Invalid response from server");
      }
      setResult(data.data);
      // Step 2: For each section, fetch one image automatically
      // (No longer needed: let backend handle all image selection and fallback)
      // Step 3: Immediately create the essay
      // Use backend's selected_image_url for each section
      const updatedSections = data.data.sections.map((section: any) => ({
        ...section,
        selected_image_url: section.selected_image_url || "",
      }));
      const updatedResult = {
        ...data.data,
        sections: updatedSections,
      };
      setResult(updatedResult);
      // Create essay
      if (!authHeaders.Authorization)
        throw new Error("Not authenticated. Please log in to create an essay.");
      const youtubeVideoCode = extractYoutubeVideoCode(youtubeUrl);
      const essayRes = await fetch(
        createApiUrl(API_CONFIG.ENDPOINTS.ESSAYS.HTML),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
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
        }
      );
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
        const creditResponse = await fetch(createApiUrl("/credits/use"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
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

        // Complete processing in queue (only if we have a queue item or were processing)
        if (queueItemId || isLoading) {
          console.log("[VIVID GENERATOR] Completing queue processing");
          await fetch(createApiUrl("/queue/complete"), {
            method: "POST",
            headers: authHeaders,
          });
        }

        // Clear queue state since processing is complete
        setQueueItemId(null);
        setShowQueueModal(false);
      } else {
        throw new Error(essayData.message || "Failed to create essay");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error in Vivid Generator:", err);

      // Complete processing on error (cleanup) - only if we were actually processing
      if (queueItemId || isLoading) {
        try {
          console.log(
            "[VIVID GENERATOR] Cleaning up queue processing after error"
          );
          const cleanupHeaders = getAuthHeaders();
          await fetch(createApiUrl("/queue/complete"), {
            method: "POST",
            headers: cleanupHeaders as HeadersInit,
          });

          // Clear queue state after cleanup
          setQueueItemId(null);
          setShowQueueModal(false);
        } catch (cleanupErr) {
          console.error("Error cleaning up queue:", cleanupErr);
        }
      }
    } finally {
      setIsLoading(false);
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
    setError(null);

    try {
      // Step 1: Check rate limit and queue status
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error("Not authenticated. Please log in to create an essay.");
      }

      const queueResponse = await fetch(createApiUrl("/queue/check"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!queueResponse.ok) {
        throw new Error("Failed to check queue status");
      }

      const queueData = await queueResponse.json();

      if (!queueData.success) {
        throw new Error(queueData.message || "Failed to check queue status");
      }

      // If can't process immediately, show queue modal
      if (!queueData.data.canProcess) {
        setQueueItemId(queueData.data.queueItemId || null);
        setIsLoading(false);
        setShowQueueModal(true);
        return;
      }

      // Step 2: For immediate processing, tryStartImmediateProcessing already started it
      // Skip /queue/start call and go directly to essay processing
      await processEssay();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleCloseQueueModal = () => {
    setShowQueueModal(false);
    setQueueItemId(null);
  };

  const handleQueueReadyToProcess = async () => {
    setShowQueueModal(false);
    setIsLoading(true); // Start loading immediately to prevent double-clicks

    try {
      // For queued tabs, we need to call /queue/start when their turn comes
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error("Not authenticated");
      }

      console.log("[VIVID GENERATOR] Attempting to start queue processing...");
      const startResponse = await fetch(createApiUrl("/queue/start"), {
        method: "POST",
        headers: authHeaders,
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json().catch(() => null);
        console.error("[VIVID GENERATOR] Start processing failed:", errorData);

        if (errorData?.debug) {
          console.log("[VIVID GENERATOR] Debug info:", errorData.debug);
        }

        // Don't retry - just throw the error immediately
        // The queue system should be precise enough now that retries aren't needed
        throw new Error(errorData?.message || "Failed to start processing");
      } else {
        console.log("[VIVID GENERATOR] Queue processing started successfully");
      }

      // Continue with essay generation
      await processEssay();
    } catch (err) {
      console.error("Error starting queued processing:", err);
      setError(
        err instanceof Error ? err.message : "Failed to start processing"
      );
      setIsLoading(false); // Reset loading state on error
    }
  };

  const handleRejoinQueue = async () => {
    try {
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        setError("Authentication required");
        return;
      }

      const queueResponse = await fetch(createApiUrl("/queue/check"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!queueResponse.ok) {
        throw new Error("Failed to rejoin queue");
      }

      const queueData = await queueResponse.json();

      if (!queueData.success) {
        throw new Error(queueData.message || "Failed to rejoin queue");
      }

      // Update with new queue item ID
      if (queueData.data.queueItemId) {
        setQueueItemId(queueData.data.queueItemId);
      }

      // If can process immediately after rejoining
      if (queueData.data.canProcess) {
        setShowQueueModal(false);
        await processEssay();
      }
    } catch (err) {
      console.error("Error rejoining queue:", err);
      setError(err instanceof Error ? err.message : "Failed to rejoin queue");
    }
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

      {showQueueModal && (
        <ModalPortal>
          <QueueModal
            isOpen={showQueueModal}
            onClose={handleCloseQueueModal}
            onReadyToProcess={handleQueueReadyToProcess}
            onRejoinQueue={handleRejoinQueue}
            title={title}
            content={content}
            queueItemId={queueItemId}
          />
        </ModalPortal>
      )}
    </div>
  );
};

export default VividGenerator;
