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

  if (loading) {
    return (
      <div className="essays-container">
        <Navbar />
        <div className="loading">Loading essays...</div>
      </div>
    );
  }

  return (
    <div className="essays-container">
      <Navbar />
      <h1>All Essays</h1>
      <div className="essays-grid">
        {essays.map((essay) => (
          <div 
            key={essay._id} 
            className="essay-card"
            onClick={() => handleEssayClick(essay._id)}
          >
            {essay.tags && essay.tags.length > 0 && (
              <div className="essay-tag">{essay.tags[0]}</div>
            )}
            <h3>{essay.title}</h3>
            <p className="essay-excerpt">{essay.subtitle}</p>
            <div className="essay-meta">
              <span className="essay-author">By {essay.author.name}</span>
              <span className="essay-views">{essay.views} views</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Essays; 