import React, { useState, useEffect, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Essays.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { useInView } from 'react-intersection-observer';
import { EditEssayModal } from "../components/EditEssayModal";
import PurchaseCreditsModal from "../components/PurchaseCreditsModal";
import ModalPortal from "../components/ModalPortal";

interface Essay {
  _id: string;
  title: string;
  subtitle?: string;
  header_background_image?: string;
  createdAt: string;
  views: number;
  tags: string[];
  isPrivate: boolean;
  author?: {
    name?: string;
    _id?: string;
  };
  titleColor?: string;
  textColor?: string;
  fontFamily?: string;
  backgroundEffect?: string;
  boxBgColor?: string;
  boxOpacity?: number;
  youtubeVideoCode?: string;
}

const UserEssays: React.FC = () => {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const navigate = useNavigate();
  
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchUserEssays = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/essays/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Raw essays data from API:', response.data.essays);
      
      // Make sure we handle essays with missing data
      const processedEssays = response.data.essays.map((essay: any) => ({
        ...essay,
        subtitle: essay.subtitle || "",
        tags: (essay.tags || []).filter((tag: string) => tag !== 'html-essay'),
        views: essay.views || 0,
        author: essay.author || { name: user?.name || "Me" }
      }));

      console.log('Processed essays data:', processedEssays);
      
      setEssays(processedEssays);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user essays:", err);
      setError("Failed to load your essays");
      setLoading(false);
    }
  }, [API_URL, user?.name]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserEssays();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, fetchUserEssays, authLoading]);

  if (!authLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const filteredEssays = essays.filter((essay) => {
    return essay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (essay.subtitle && essay.subtitle.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleEssayClick = (essayId: string) => {
    navigate(`/essay/${essayId}`);
  };

  const handleEditClick = (event: React.MouseEvent, essay: Essay) => {
    event.stopPropagation(); // Prevent navigation to the essay view
    setSelectedEssay(essay);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchUserEssays(); // Refresh essays after edit
  };

  if (loading) {
    return (
      <div className="essays-container">
        <Navbar />
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Discovering your essays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="essays-container">
      <Navbar />
      
      <div className="essays-hero">
        <h1>My Essays</h1>
        <p className="hero-subtitle">Manage and view all your created essays</p>
        
        <div className="user-credits-container">
          <div className="user-credits">
            <p>Credits: <span className="credit-count">{user?.credits || 0}</span></p>
          </div>
          <button 
            className="buy-credits-btn"
            onClick={() => setShowPurchaseModal(true)}
          >
            Buy Credits
          </button>
        </div>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search your essays by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="create-essay-container">
          <Link to="/" className="create-essay-btn">
            Create New Essay
          </Link>
        </div>
      </div>

      {error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : essays.length === 0 ? (
        <div className="no-results">
          <h3>You haven't created any essays yet.</h3>
          <Link to="/" className="create-essay-btn">
            Create Your First Essay
          </Link>
        </div>
      ) : (
        <>
          <div className="essays-grid">
            {filteredEssays.length === 0 ? (
              <div className="no-results">
                <h3>No essays found</h3>
                <p>Try adjusting your search</p>
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
                    {essay.isPrivate && (
                      <div className="private-indicator">
                        <span className="private-icon">🔒</span>
                      </div>
                    )}
                    {essay.tags && essay.tags.length > 0 && (
                      <div className="essay-tags">
                        {essay.tags
                          .filter(tag => tag !== 'html-essay')
                          .map(tag => (
                            <span key={`${essay._id}-${tag}`} className="essay-tag">{tag}</span>
                          ))}
                      </div>
                    )}
                    <h3>
                      {essay.title}
                      {essay.isPrivate && <span className="title-lock-icon" title="Private essay">🔒</span>}
                    </h3>
                    {essay.subtitle && (
                      <p className="essay-excerpt">{essay.subtitle}</p>
                    )}
                    <div className="essay-meta">
                      <div className="meta-left">
                        <span className="essay-author">By {essay.author?.name || 'Me'}</span>
                        <span className="essay-date">{formatDate(essay.createdAt)}</span>
                      </div>
                      <span className="essay-views">{essay.views} views</span>
                    </div>
                    <div className="essay-actions">
                      <button 
                        className="edit-essay-btn"
                        onClick={(e) => handleEditClick(e, essay)}
                        title="Edit essay"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Loading indicator and infinite scroll trigger */}
          <div ref={ref} className="h-10 flex items-center justify-center mt-4">
            {loading && <div className="text-gray-500">Loading...</div>}
          </div>
        </>
      )}

      {/* Edit Essay Modal */}
      <EditEssayModal
        essay={selectedEssay}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
      
      {/* Purchase Credits Modal */}
      {showPurchaseModal && user && (
        <ModalPortal>
          <PurchaseCreditsModal
            isOpen={showPurchaseModal}
            onClose={() => setShowPurchaseModal(false)}
            currentCredits={user.credits}
          />
        </ModalPortal>
      )}
    </div>
  );
};

export default UserEssays; 