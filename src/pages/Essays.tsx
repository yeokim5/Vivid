import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/Essays.css";

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

const Essays: React.FC = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEssays = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/essays");
        if (!response.ok) {
          throw new Error("Failed to fetch essays");
        }
        const data = await response.json();
        setEssays(data);
      } catch (error) {
        console.error("Error fetching essays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEssays();
  }, []);

  const handleEssayClick = (essayId: string) => {
    navigate(`/essay/${essayId}`);
  };

  const filteredEssays = essays
    .filter((essay) => {
      const matchesSearch = essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        essay.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !selectedTag || (essay.tags && essay.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return b.views - a.views;
      }
    });

  const allTags = Array.from(new Set(essays.flatMap(essay => essay.tags || [])));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="essays-container">
        <Navbar />
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Discovering brilliant essays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="essays-container">
      <Navbar />
      
      <div className="essays-hero">
        <h1>Explore Essays</h1>
        <p className="hero-subtitle">Discover thought-provoking essays from creative minds</p>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search essays by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="essays-controls">
        <div className="tags-filter">
          <button 
            className={`tag-btn ${!selectedTag ? 'active' : ''}`}
            onClick={() => setSelectedTag(null)}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-btn ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="sort-controls">
          <button
            className={`sort-btn ${sortBy === 'latest' ? 'active' : ''}`}
            onClick={() => setSortBy('latest')}
          >
            Latest
          </button>
          <button
            className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
            onClick={() => setSortBy('popular')}
          >
            Most Popular
          </button>
        </div>
      </div>

      <div className="essays-grid">
        {filteredEssays.length === 0 ? (
          <div className="no-results">
            <h3>No essays found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredEssays.map((essay) => (
            <div 
              key={essay._id} 
              className="essay-card"
              onClick={() => handleEssayClick(essay._id)}
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
          ))
        )}
      </div>
    </div>
  );
};

export default Essays; 