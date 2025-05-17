import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/LandingPage.css";

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
  const [essayTitle, setEssayTitle] = useState("");
  const [essayText, setEssayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Add animation classes after component mounts
    const timer = setTimeout(() => {
      document.querySelector(".hero-content")?.classList.add("visible");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleButtonClick = () => {
    // Check if there's content to process
    if (essayText.trim()) {
      // Store the essay content and title in localStorage for access after login
      localStorage.setItem("pendingEssayTitle", essayTitle);
      localStorage.setItem("pendingEssayContent", essayText);

      // Navigate to login page
      navigate("/login");
    } else {
      // You could add validation UI feedback here
      alert("Please enter some essay content before proceeding.");
    }
  };

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

  return (
    <div className="landing-container">
      <Navbar />

      <div className="hero-section">
        <div className="hero-content">
          <h1>Vivid</h1>
          <h2>Transform Your Essay Into a Visual Experience</h2>

          <div className="essay-input-container">
            <div className="input-label">
              <span>Start with your idea or essay</span>
            </div>
            <input
              type="text"
              className="essay-title-input"
              placeholder="Enter essay title..."
              value={essayTitle}
              onChange={handleTitleChange}
            />
            <textarea
              className={`essay-input ${isTyping ? "has-text" : ""}`}
              placeholder="Paste your essay here (limited to 1000 words)..."
              value={essayText}
              onChange={handleEssayChange}
            />
            <div className="word-count">{wordCount}/1000 words</div>
            <button className="analyze-btn" onClick={handleButtonClick}>
              <span className="btn-icon">✨</span>
              Make It Vivid
            </button>
          </div>
        </div>

        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="popular-essays-section">
        <h2>Today's Most Viewed Essays</h2>
        <div className="essays-grid">
          {popularEssays.map((essay) => (
            <div className="essay-card" key={essay.id}>
              <div className="essay-tag">{essay.tag}</div>
              <h3>{essay.title}</h3>
              <p className="essay-excerpt">{essay.excerpt}</p>
              <div className="essay-meta">
                <span className="essay-author">By {essay.author}</span>
                <span className="essay-views">{essay.views} views</span>
              </div>
            </div>
          ))}
        </div>
        <div className="explore-more">
          <button className="explore-btn">Explore More Essays</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
