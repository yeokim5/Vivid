import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/EditEssayModal.css";
import CustomizeEssay from "./CustomizeEssay";
import { createApiUrl, getAuthHeaders } from "../config/api";
import { DEFAULT_STYLES, FONT_OPTIONS } from "../constants/styles";

interface Essay {
  _id: string;
  title: string;
  subtitle?: string;
  titleColor?: string;
  textColor?: string;
  fontFamily?: string;
  boxBgColor?: string;
  boxOpacity?: number;
  backgroundEffect?: string;
  isPrivate?: boolean;
  youtubeVideoCode?: string;
}

interface EditEssayModalProps {
  essay: Essay | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditEssayModal: React.FC<EditEssayModalProps> = ({
  essay,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [titleColor, setTitleColor] = useState<string>(
    DEFAULT_STYLES.titleColor
  );
  const [textColor, setTextColor] = useState<string>(DEFAULT_STYLES.textColor);
  const [boxBgColor, setBoxBgColor] = useState<string>(
    DEFAULT_STYLES.boxBgColor
  );
  const [boxOpacity, setBoxOpacity] = useState<number>(
    DEFAULT_STYLES.boxOpacity
  );
  const [selectedFont, setSelectedFont] = useState<string>(
    DEFAULT_STYLES.fontFamily
  );
  const [selectedBackgroundEffect, setSelectedBackgroundEffect] =
    useState<string>(DEFAULT_STYLES.backgroundEffect);
  const [isPrivate, setIsPrivate] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (essay) {
      // Set basic essay details
      setTitle(essay.title || "");
      setSubtitle(essay.subtitle || "");

      // Set styling properties with proper fallbacks
      setTitleColor(essay.titleColor || "#f8f9fa");
      setTextColor(essay.textColor || "#f8f9fa");
      setSelectedFont(essay.fontFamily || "Playfair Display");
      setSelectedBackgroundEffect(essay.backgroundEffect || "none");
      setIsPrivate(essay.isPrivate || false);

      // Fix for boxBgColor and boxOpacity - always use the values from the essay object if they exist
      // or fall back to defaults if they don't
      setBoxBgColor(essay.boxBgColor || "#585858");
      setBoxOpacity(
        essay.boxOpacity !== undefined ? Number(essay.boxOpacity) : 0.5
      );

      // Set YouTube URL if available
      if (essay.youtubeVideoCode) {
        setYoutubeUrl(
          `https://www.youtube.com/watch?v=${essay.youtubeVideoCode}`
        );
      } else {
        setYoutubeUrl("");
      }
    }
  }, [essay]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!essay) return;

    try {
      setLoading(true);
      setError(null);

      // Extract YouTube video code if present
      let youtubeVideoCode = "";
      if (youtubeUrl) {
        const youtubeRegex =
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = youtubeUrl.match(youtubeRegex);
        if (match && match[1]) {
          youtubeVideoCode = match[1];
        }
      }

      const authHeaders = getAuthHeaders();
      const response = await axios.put(
        createApiUrl(`/essays/${essay._id}`),
        {
          title,
          subtitle,
          titleColor,
          textColor,
          fontFamily: selectedFont,
          backgroundEffect: selectedBackgroundEffect,
          boxBgColor,
          boxOpacity,
          isPrivate,
          youtubeVideoCode,
        },
        {
          headers: {
            ...authHeaders,
          },
        }
      );

      if (response.status === 200) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Error updating essay:", err);
      setError("Failed to update essay. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-essay-modal-overlay">
      <div className="edit-essay-modal">
        <div className="edit-essay-modal-header">
          <h2>Edit Essay</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subtitle">Subtitle</label>
            <input
              type="text"
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="appearance-section">
            <h3>Customize Appearance</h3>
            <div className="customize-wrapper">
              <CustomizeEssay
                titleColor={titleColor}
                setTitleColor={setTitleColor}
                textColor={textColor}
                setTextColor={setTextColor}
                boxBgColor={boxBgColor}
                setBoxBgColor={setBoxBgColor}
                boxOpacity={boxOpacity}
                setBoxOpacity={setBoxOpacity}
                selectedFont={selectedFont}
                setSelectedFont={setSelectedFont}
                selectedBackgroundEffect={selectedBackgroundEffect}
                setSelectedBackgroundEffect={setSelectedBackgroundEffect}
                isPrivate={isPrivate}
                setIsPrivate={setIsPrivate}
                youtubeUrl={youtubeUrl}
                setYoutubeUrl={setYoutubeUrl}
                fontOptions={[...FONT_OPTIONS]}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
