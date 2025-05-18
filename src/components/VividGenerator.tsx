import React, { useState } from "react";
import "../styles/VividGenerator.css";
import ImageSelectionFlow from "./ImageSelectionFlow";

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
  sections: Section[];
}

interface EssayJsonResponse {
  success: boolean;
  message: string;
  filename: string;
  filePath: string;
  essayJson: Record<string, any>;
}

const VividGenerator: React.FC<VividGeneratorProps> = ({ title, content }) => {
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
  const [jsonOutput, setJsonOutput] = useState<Record<string, any> | null>(
    null
  );
  const [jsonFilePath, setJsonFilePath] = useState<string | null>(null);
  const [showJsonContent, setShowJsonContent] = useState(false);

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

  const handleMakeVivid = async () => {
    // Clear previous errors
    setError(null);

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
        const suggestions: Record<string, string> = {};
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

        if (selectedImageUrl) {
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
        // Generate the JSON file with the essay content and selected images
        const response = await fetch(
          "http://localhost:5000/api/sections/generate-json",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: updatedResult.title,
              sections: updatedResult.sections,
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

        if (data.success) {
          setJsonOutput(data.essayJson);
          setJsonFilePath(data.filePath);
          console.log("Essay JSON generated:", data.essayJson);
          console.log("JSON file saved at:", data.filePath);
        } else {
          throw new Error(data.message || "Failed to generate JSON file");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate JSON output"
        );
        console.error("Error generating JSON:", err);
      }
    }

    setShowImageSelectionFlow(false);
  };

  const handleCloseImageSelectionFlow = () => {
    setShowImageSelectionFlow(false);
  };

  const toggleJsonContent = () => {
    setShowJsonContent(!showJsonContent);
  };

  return (
    <div className="vivid-generator">
      <button
        className="analyze-btn"
        onClick={handleMakeVivid}
        disabled={isLoading}
      >
        <span className="btn-icon">✨</span>
        {isLoading ? "Processing..." : "Make It Vivid"}
      </button>

      {error && <div className="error-message">{error}</div>}

      {jsonOutput && (
        <div className="json-output">
          <h3>Essay JSON Generated</h3>
          <p>Your essay has been successfully processed and saved as JSON.</p>
          {jsonFilePath && (
            <div>
              <p>
                File path: <code>{jsonFilePath}</code>
              </p>
              <div className="json-actions">
                <a
                  href={`http://localhost:5000${jsonFilePath}`}
                  download
                  className="download-btn"
                >
                  Download JSON File
                </a>
                <button className="view-json-btn" onClick={toggleJsonContent}>
                  {showJsonContent ? "Hide JSON Content" : "View JSON Content"}
                </button>
              </div>

              {showJsonContent && (
                <div className="json-preview">
                  <pre>{JSON.stringify(jsonOutput, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showImageSelectionFlow && result && (
        <ImageSelectionFlow
          isOpen={showImageSelectionFlow}
          onClose={handleCloseImageSelectionFlow}
          sections={result.sections}
          title={result.title}
          onComplete={handleBackgroundImagesSelected}
        />
      )}
    </div>
  );
};

export default VividGenerator;
