import React from 'react';
import '../styles/CustomizeEssay.css';

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
  fontOptions
}) => {
  return (
    <div className="customize-essay-container">
      <div className="style-preview">
        <p>Preview:</p>
        <div 
          className="preview-container"
          style={{ 
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px',
            margin: '10px 0'
          }}
        >
          {/* Background effect preview */}
          <div className="preview-background-effect">
            {selectedBackgroundEffect === 'blob' && (
              <div className="preview-blob">
                <div 
                  className="blob"
                  style={{
                    top: '30%',
                    left: '30%'
                  }}
                ></div>
                <div 
                  className="blob"
                  style={{
                    top: '60%',
                    left: '60%',
                    animationDelay: '-3s',
                    background: 'linear-gradient(45deg, #6e48aa, #9d50bb)'
                  }}
                ></div>
                <div 
                  className="blob"
                  style={{
                    top: '40%',
                    left: '75%',
                    animationDelay: '-5s',
                    background: 'linear-gradient(45deg, #00c9ff, #92fe9d)'
                  }}
                ></div>
              </div>
            )}
            {selectedBackgroundEffect === 'firefly' && (
              <div className="preview-firefly">
                {Array(20).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className="particle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`
                    }}
                  ></div>
                ))}
              </div>
            )}
            {selectedBackgroundEffect === 'particles' && (
              <div className="preview-particles">
                {Array(25).fill(0).map((_, i) => (
                  <div 
                    key={i} 
                    className="particle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`
                    }}
                  ></div>
                ))}
              </div>
            )}
            {selectedBackgroundEffect === 'gradient' && (
              <div className="preview-gradient">
                <div className="gradient-bg"></div>
              </div>
            )}
          </div>
          
          {/* Content box */}
          <div 
            style={{ 
              padding: '20px',
              position: 'relative',
              zIndex: 1
            }}
          >
            <h4 
              style={{ 
                color: titleColor, 
                display: "inline-block"
              }}
            >
              Sample Title
            </h4>
            <div
              style={{
                background: `rgba(${parseInt(boxBgColor.slice(1, 3), 16)}, ${parseInt(boxBgColor.slice(3, 5), 16)}, ${parseInt(boxBgColor.slice(5, 7), 16)}, ${boxOpacity})`,
                padding: '15px',
                borderRadius: '8px',
                marginTop: '10px'
              }}
            >
              <p style={{ color: textColor }}>
                This is how your essay text will appear.
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
            {fontOptions.map(font => (
              <option 
                key={font} 
                value={font} 
                style={{ fontFamily: font }}
              >
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
            <option value="blob">Blob Animation</option>
            <option value="firefly">Firefly Particles</option>
            <option value="particles">Floating Particles</option>
            <option value="gradient">Gradient Aurora</option>
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
                <span className="privacy-icon">
                  {isPrivate ? "🔒" : "🔓"}
                </span>
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
          <label>YouTube Video URL</label>
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Paste YouTube video URL here..."
            className="youtube-input"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomizeEssay; 