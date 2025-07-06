import React, { useEffect, useRef } from "react";
import "../styles/CustomizeEssay.css";

interface CustomizeEssayProps {
  titleColor: string;
  setTitleColor: (color: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  boxBgColor: string;
  setBoxBgColor: (color: string) => void;
  boxOpacity: number;
  setBoxOpacity: (opacity: number) => void;
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  selectedBackgroundEffect: string;
  setSelectedBackgroundEffect: (effect: string) => void;
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;
  fontOptions: string[];
}

const CustomizeEssay: React.FC<CustomizeEssayProps> = ({
  titleColor,
  setTitleColor,
  textColor,
  setTextColor,
  boxBgColor,
  setBoxBgColor,
  boxOpacity,
  setBoxOpacity,
  selectedFont,
  setSelectedFont,
  selectedBackgroundEffect,
  setSelectedBackgroundEffect,
  isPrivate,
  setIsPrivate,
  youtubeUrl,
  setYoutubeUrl,
  fontOptions,
}) => {
  const heartContainerRef = useRef<HTMLDivElement>(null);
  const fireflyContainerRef = useRef<HTMLDivElement>(null);
  const particlesContainerRef = useRef<HTMLDivElement>(null);

  // Effect to handle heart animation in the preview
  useEffect(() => {
    if (selectedBackgroundEffect === "heart" && heartContainerRef.current) {
      const container = heartContainerRef.current;
      container.innerHTML = ""; // Clear existing hearts

      // Heart creation function
      const createHeart = () => {
        const heart = document.createElement("div");
        heart.classList.add("heart");

        heart.style.left = Math.random() * 100 + "%";
        heart.style.animationDuration = Math.random() * 2 + 3 + "s";
        heart.innerHTML = "💗";

        container.appendChild(heart);

        // Remove heart after animation completes (5 seconds)
        setTimeout(() => {
          heart.remove();
        }, 5000);
      };

      // Create a few initial hearts
      for (let i = 0; i < 5; i++) {
        setTimeout(() => createHeart(), Math.random() * 1000);
      }

      // Create hearts continuously, just like in the actual essay
      const heartInterval = setInterval(createHeart, 300);

      // Clean up interval when component unmounts or effect changes
      return () => {
        clearInterval(heartInterval);
      };
    }

    if (selectedBackgroundEffect === "firefly" && fireflyContainerRef.current) {
      const container = fireflyContainerRef.current;
      container.innerHTML = ""; // Clear existing fireflies

      // Create simplified fireflies for the preview - matching template.html
      for (let i = 0; i < 5; i++) {
        const firefly = document.createElement("div");
        firefly.classList.add("firefly");

        // Position in center with proper margin and transform origin
        firefly.style.left = "50%";
        firefly.style.top = "50%";
        firefly.style.margin = "-0.2vw 0 0 9.8vw";

        // Add custom animation name
        const rotationSpeed = Math.floor(Math.random() * 10) + 8;
        const flashDuration = Math.floor(Math.random() * 3000) + 2000;
        const flashDelay = Math.floor(Math.random() * 2000) + 500;

        // Add custom properties for pseudo-elements
        const styleElement = document.createElement("style");
        styleElement.textContent = `
          .firefly:nth-child(${i + 1})::before {
            animation-duration: ${rotationSpeed}s;
          }
          .firefly:nth-child(${i + 1})::after {
            animation-duration: ${rotationSpeed}s, ${flashDuration}ms;
            animation-delay: 0ms, ${flashDelay}ms;
          }
        `;

        firefly.appendChild(styleElement);
        container.appendChild(firefly);
      }
    }

    if (
      selectedBackgroundEffect === "particles" &&
      particlesContainerRef.current
    ) {
      const container = particlesContainerRef.current;
      container.innerHTML = ""; // Clear existing particles

      // Create particles for the preview
      for (let i = 0; i < 25; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");

        // Position at the bottom
        const left = Math.random() * 100;
        particle.style.left = `${left}%`;
        particle.style.bottom = "-20px";

        // Add random delay to make movement more natural
        const delay = Math.random() * 20;
        particle.style.animationDelay = `${delay}s`;

        container.appendChild(particle);
      }
    }
  }, [selectedBackgroundEffect]);

  return (
    <div className="customize-essay-container">
      <div className="style-preview">
        <p>Preview:</p>
        <div
          className="preview-container"
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "8px",
            margin: "10px 0",
          }}
        >
          {/* Background effect preview */}
          <div className="preview-background-effect">
            {selectedBackgroundEffect === "heart" && (
              <div className="preview-heart" ref={heartContainerRef}></div>
            )}
            {selectedBackgroundEffect === "firefly" && (
              <div className="preview-firefly" ref={fireflyContainerRef}></div>
            )}
            {selectedBackgroundEffect === "particles" && (
              <div
                className="preview-particles"
                ref={particlesContainerRef}
              ></div>
            )}
          </div>

          {/* Content box */}
          <div
            style={{
              padding: "20px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <h4
              style={{
                color: titleColor,
                display: "inline-block",
                fontFamily: selectedFont,
              }}
            >
              Sample Title
            </h4>
            <div
              style={{
                background: `rgba(${parseInt(
                  boxBgColor.slice(1, 3),
                  16
                )}, ${parseInt(boxBgColor.slice(3, 5), 16)}, ${parseInt(
                  boxBgColor.slice(5, 7),
                  16
                )}, ${boxOpacity})`,
                padding: "15px",
                borderRadius: "8px",
                marginTop: "10px",
              }}
            >
              <p style={{ color: textColor, fontFamily: selectedFont }}>
                This is how your text will appear.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="styling-grid">
        <div className="styling-item">
          <label>Title Color</label>
          <div className="color-input-container">
            <input
              type="color"
              value={titleColor}
              onChange={(e) => setTitleColor(e.target.value)}
              className="color-picker"
            />
            <span className="color-value">{titleColor}</span>
          </div>
        </div>

        <div className="styling-item">
          <label>Text Color</label>
          <div className="color-input-container">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="color-picker"
            />
            <span className="color-value">{textColor}</span>
          </div>
        </div>

        <div className="styling-item">
          <label>Box Background Color</label>
          <div className="color-input-container">
            <input
              type="color"
              value={boxBgColor}
              onChange={(e) => setBoxBgColor(e.target.value)}
              className="color-picker"
            />
            <span className="color-value">{boxBgColor}</span>
          </div>
        </div>

        <div className="styling-item">
          <label>Box Opacity: {boxOpacity.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={boxOpacity}
            onChange={(e) => setBoxOpacity(parseFloat(e.target.value))}
            className="opacity-slider"
          />
        </div>

        <div className="styling-item">
          <label>Font Family</label>
          <select
            value={selectedFont}
            onChange={(e) => setSelectedFont(e.target.value)}
            className="font-selector"
          >
            {fontOptions.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        <div className="styling-item">
          <label>Background Effect</label>
          <select
            value={selectedBackgroundEffect}
            onChange={(e) => setSelectedBackgroundEffect(e.target.value)}
            className="font-selector"
          >
            <option value="none">None</option>
            <option value="firefly">Firefly Particles</option>
            <option value="particles">Floating Particles</option>
            <option value="heart">Heart Effect</option>
          </select>
        </div>

        <div className="styling-item">
          <label>Privacy Settings</label>
          <div className="privacy-toggle">
            <div className="toggle-container">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="privacy-label">
                <span className="privacy-icon">{isPrivate ? "🔒" : "🔓"}</span>
                {isPrivate ? "Private" : "Public"}
              </span>
            </div>
            <p className="privacy-description">
              {isPrivate
                ? "Private essays will not be available in search results and can only be accessed by url."
                : "Public essays will be visible to everyone and can be found in explore page."}
            </p>
          </div>
        </div>

        <div className="styling-item">
          <label>
            Background Music
            <br />
            <small>(Works on desktop; may not play on mobile devices)</small>
          </label>

          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="(Optional) Paste YouTube video URL here..."
            className="youtube-input"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomizeEssay;
