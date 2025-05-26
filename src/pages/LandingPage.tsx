import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import VividGenerator from "../components/VividGenerator";
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
  const navigate = useNavigate();

  useEffect(() => {
    // Add animation classes after component mounts
    const timer = setTimeout(() => {
      document.querySelector(".hero-content")?.classList.add("visible");
    }, 100);

    // Fetch popular essays
    const fetchPopularEssays = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/essays");
        if (!response.ok) {
          throw new Error("Failed to fetch essays");
        }
        const data = await response.json();
        // Sort by views and take top 3
        const sortedEssays = data.sort((a: Essay, b: Essay) => b.views - a.views).slice(0, 3);
        setEssays(sortedEssays);
      } catch (error) {
        console.error("Error fetching essays:", error);
      }
    };

    fetchPopularEssays();
    return () => clearTimeout(timer);
  }, []);

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

  return (
    <div className="landing-container">
      <Navbar />

      <div className="hero-section">
        <div className="hero-content">
          <h1>Vivid</h1>
          <h2>Transform Your Essay Into a Visual Experience</h2>

          <div className="essay-input-container">
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

            <VividGenerator title={essayTitle} content={essayText} />
          </div>
        </div>

        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
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
                    {essay.tags.map(tag => (
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
