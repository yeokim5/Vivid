import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import VividGenerator from "../components/VividGenerator";
import BackgroundEffects from "../components/BackgroundEffects";
import CustomizeEssay from "../components/CustomizeEssay";
import FluidBackground from "../components/FluidBackground";
import "../styles/LandingPage.css";

interface Essay {
  _id: string;
  title: string;
  subtitle: string;
  header_background_image: string;
  author: {
    _id: string;
    name: string;
  };
  views: number;
  createdAt: string;
  tags?: string[];
}

// Placeholder for popular essays data
const popularEssays = [
  {
    id: 1,
    title: "The Impact of Technology on Modern Education",
    author: "John Smith",
    views: 1245,
    excerpt: "Technology has revolutionized education in numerous ways...",
    tag: "Technology",
  },
  {
    id: 2,
    title: "Climate Change: A Global Crisis",
    author: "Sarah Johnson",
    views: 982,
    excerpt:
      "The effects of climate change are becoming increasingly apparent...",
    tag: "Environment",
  },
  {
    id: 3,
    title: "The Role of Artificial Intelligence in Healthcare",
    author: "Dr. Michael Brown",
    views: 874,
    excerpt: "AI is transforming healthcare delivery and patient outcomes...",
    tag: "AI & Health",
  },
];

const LandingPage: React.FC = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [essayTitle, setEssayTitle] = useState("");
  const [essayText, setEssayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [titleColor, setTitleColor] = useState("#f8f9fa"); // Default white
  const [textColor, setTextColor] = useState("#f8f9fa"); // Default white
  const [selectedFont, setSelectedFont] = useState("Playfair Display"); // Default font
  const [boxBgColor, setBoxBgColor] = useState("#585858"); // Default box background color
  const [boxOpacity, setBoxOpacity] = useState(0.5); // Default box opacity
  const [selectedBackgroundEffect, setSelectedBackgroundEffect] = useState("none"); // Default background effect
  const [isPrivate, setIsPrivate] = useState(false); // Add privacy state
  const [youtubeUrl, setYoutubeUrl] = useState(""); // Add YouTube URL state
  const [showCustomize, setShowCustomize] = useState(false); // State to toggle customize section
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const navigate = useNavigate();

  useEffect(() => {
    // Add animation classes after component mounts
    const timer = setTimeout(() => {
      document.querySelector(".hero-content")?.classList.add("visible");
    }, 100);

    // Fetch popular essays
    const fetchPopularEssays = async () => {
      try {
        const response = await fetch(`${API_URL}/essays?sortBy=popular&limit=3`);
        if (!response.ok) {
          throw new Error("Failed to fetch essays");
        }
        const data = await response.json();
        // The essays are already sorted by views from the backend
        setEssays(data.essays);
      } catch (error) {
        console.error("Error fetching essays:", error);
      }
    };

    fetchPopularEssays();
    return () => clearTimeout(timer);
  }, [API_URL]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEssayTitle(e.target.value);
  };

  const handleEssayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    // Limit to 1000 words
    const words = text.trim().split(/\s+/);
    if (words.length <= 1000) {
      setEssayText(text);
    }
    setIsTyping(text.length > 0);
  };

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const handleExploreMore = () => {
    navigate('/essays');
  };

  const toggleCustomizeSection = () => {
    setShowCustomize(!showCustomize);
  };

  const fontOptions = [
    "Playfair Display", 
    "Inter", 
    "Roboto", 
    "Montserrat", 
    "Lora", 
    "Merriweather", 
    "Open Sans"
  ];

  // Use useEffect to load fonts for the dropdown
  useEffect(() => {
    // We'll use Web Font Loader to load fonts only for the preview section
    // This avoids affecting the entire page
    const loadFonts = async () => {
      // Instead of loading all fonts at once, we'll just ensure they're available for the dropdown
      // but not apply them globally
      const WebFontConfig = {
        google: {
          families: fontOptions.map(font => `${font}:400,700`)
        },
        classes: false,  // Don't add classes to the HTML element
        events: false    // Don't trigger events
      };
      
      // Create a script element for Web Font Loader
      const script = document.createElement('script');
      script.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
      script.async = true;
      
      // Once the script is loaded, configure it
      script.onload = () => {
        // @ts-ignore
        window.WebFont.load(WebFontConfig);
      };
      
      document.head.appendChild(script);
    };
    
    loadFonts();
  }, []);
  
  // Separate useEffect to apply the selected font ONLY to the preview section
  useEffect(() => {
    // Create a style element to scope the font to the preview only
    const style = document.createElement('style');
    
    // Create the stylesheet with scoped selectors for the preview only
    // We use !important to ensure it doesn't leak to other elements
    style.textContent = `
      /* Only apply font to preview elements */
      .style-preview h4, .style-preview p {
        font-family: "${selectedFont}", sans-serif !important;
      }
      
      /* Explicitly set font for important elements outside the preview section */
      .customize-toggle-btn, .explore-btn, .nav-btn-secondary, button, .profile, .profile-menu-item {
        font-family: "Merriweather", monospace !important;
      }
    `;
    style.id = 'dynamic-font-style';
    
    // Remove any existing dynamic font style
    const existingStyle = document.getElementById('dynamic-font-style');
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    
    // Add the new style
    document.head.appendChild(style);
    
    return () => {
      // Cleanup function
      const styleToRemove = document.getElementById('dynamic-font-style');
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, [selectedFont]);
  
  // Effect to handle background effects
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'main-background-effect-style';
    
    // Remove any existing style first
    const existingStyle = document.getElementById('main-background-effect-style');
    if (existingStyle) {
      document.head.removeChild(existingStyle);
    }
    
    // Add the style to the document head if needed in the future
    if (style.textContent) {
      document.head.appendChild(style);
    }
    
    return () => {
      const styleToRemove = document.getElementById('main-background-effect-style');
      if (styleToRemove) {
        document.head.removeChild(styleToRemove);
      }
    };
  }, [selectedBackgroundEffect]);

  return (
    <div className="landing-container">
      <Navbar />

      <div className="hero-section">
        <FluidBackground complexity={2} />
        {/* Add the active background effect to the main app, but not for heart effect */}
        {selectedBackgroundEffect !== 'none' && selectedBackgroundEffect !== 'heart' && (
          <BackgroundEffects selectedEffect={selectedBackgroundEffect} onSelectEffect={setSelectedBackgroundEffect} />
        )}
        <div className="hero-content">
          <h1 style={{fontFamily: "Ariel"}}>Vivid</h1>
          <h2>
            Transform Your
            <span className="rotating-words">
              <span>Essay</span>
              <span>Letter</span>
              <span>Poem</span>
              <span>Journal</span>
              <span>Story</span>
            </span>
            Into a Visual Experience
          </h2>

          <div className="essay-input-container">
            <input
              type="text"
              className="essay-title-input"
              placeholder="Enter title..."
              value={essayTitle}
              onChange={handleTitleChange}
            />
            <textarea
              className={`essay-input ${isTyping ? "has-text" : ""}`}
              placeholder="Paste your text here (limited to 1000 words)..."
              value={essayText}
              onChange={handleEssayChange}
            />
            <div className="word-count">{wordCount}/1000 words</div>

            {/* Customize Toggle Button */}
            <button 
              className="customize-toggle-btn"
              onClick={toggleCustomizeSection}
            >
              Customize Your Appearance
              <span className="toggle-arrow">{showCustomize ? '▲' : '▼'}</span>
            </button>

            {/* Conditionally render the customize component */}
            {showCustomize && (
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
                fontOptions={fontOptions}
              />
            )}

            <VividGenerator 
              title={essayTitle} 
              content={essayText} 
              titleColor={titleColor}
              textColor={textColor}
              fontFamily={selectedFont}
              boxBgColor={boxBgColor}
              boxOpacity={boxOpacity}
              backgroundEffect={selectedBackgroundEffect}
              isPrivate={isPrivate}
              youtubeUrl={youtubeUrl}
              onPrivacyChange={setIsPrivate}
              onYoutubeUrlChange={setYoutubeUrl}
            />
          </div>
        </div>
      </div>

      <div className="popular-essays-section">
        <h2>Vivid Essays</h2>
        <p className="section-subtitle">Discover our readers' favorite pieces</p>
        
        <div className="essays-grid">
          {essays.map((essay) => (
            <div 
              key={essay._id} 
              className="essay-card"
              onClick={() => navigate(`/essay/${essay._id}`)}
            >
              {essay.header_background_image && (
                <div 
                  className="essay-header-image"
                  style={{ backgroundImage: `url(${essay.header_background_image})` }}
                />
              )}
              <div className="essay-content">
                {essay.tags && essay.tags.length > 0 && (
                  <div className="essay-tags">
                    {essay.tags.filter(tag => tag !== 'html-essay').map(tag => (
                      <span key={tag} className="essay-tag">{tag}</span>
                    ))}
                  </div>
                )}
                <h3>{essay.title}</h3>
                <p className="essay-excerpt">{essay.subtitle}</p>
                <div className="essay-meta">
                  <div className="meta-left">
                    <span className="essay-author">By {essay.author.name}</span>
                    <span className="essay-date">{formatDate(essay.createdAt)}</span>
                  </div>
                  <span className="essay-views">{essay.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="explore-more">
          <button className="explore-btn" onClick={handleExploreMore}>
            Explore More Essays
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
