import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/ViewEssay.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error rendering essay:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error">
          <p>Error rendering essay content. Please try refreshing the page.</p>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.toString()}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

const ViewEssay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEssay = async () => {
      try {
        // Check if this user has already viewed this essay
        const viewedEssays = JSON.parse(localStorage.getItem('vivid_loginTimestamp') || '{}');
        const now = Date.now();
        const viewExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        // Clean up expired views
        Object.keys(viewedEssays).forEach(essayId => {
          if (now - viewedEssays[essayId] > viewExpiry) {
            delete viewedEssays[essayId];
          }
        });
        
        const hasViewed = viewedEssays[id || ''];

        // If this is the first view or the view has expired, increment the view count
        if (!hasViewed && id) {
          try {
            const viewResponse = await fetch(`${API_URL}/essays/${id}/view`, {
              method: 'POST'
            });
            if (viewResponse.ok) {
              // Mark this essay as viewed by this user with current timestamp
              viewedEssays[id] = now;
              localStorage.setItem('vivid_loginTimestamp', JSON.stringify(viewedEssays));
            }
          } catch (error) {
            console.error("Failed to increment view count:", error);
          }
        }

        // Fetch the essay content
        const response = await fetch(`${API_URL}/essays/${id}/render`);
        if (!response.ok) {
          throw new Error("Failed to fetch essay");
        }
        const html = await response.text();

        // Write the content to the iframe
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            // Add CSS to handle scrolling properly
            iframeDoc.write(`
              <style>
                html, body {
                  margin: 0;
                  padding: 0;
                  height: 100%;
                  width: 100%;
                  background-color: #0a0a0a;
                  color: #f8f9fa;
                }
                .smooth-wrapper {
                  height: 100%;
                  overflow-y: auto;
                  overflow-x: hidden;
                  scroll-behavior: smooth;
                }
                .smooth-content {
                  height: 100%;
                }
                section {
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                /* Hide scrollbar for Chrome, Safari and Opera */
                .smooth-wrapper::-webkit-scrollbar {
                  display: none;
                }
                /* Hide scrollbar for IE, Edge and Firefox */
                .smooth-wrapper {
                  -ms-overflow-style: none;  /* IE and Edge */
                  scrollbar-width: none;  /* Firefox */
                }
                /* Music player container */
                .music-player-container {
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  z-index: 1000;
                }
                /* Music icon */
                .music-icon {
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  z-index: 1001;
                  background: rgba(0, 0, 0, 0.7);
                  padding: 10px;
                  border-radius: 50%;
                  cursor: pointer;
                  transition: background-color 0.3s ease;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .music-icon:hover {
                  background: rgba(0, 0, 0, 0.9);
                }
                .music-icon svg {
                  width: 24px;
                  height: 24px;
                  fill: #fff;
                }
                .music-svg {
                  display: block;
                }
                .minus-svg {
                  display: none;
                }
                /* Music player */
                .music-player {
                  position: fixed;
                  top: 70px;
                  right: 20px;
                  z-index: 1000;
                  background: rgba(0, 0, 0, 0.7);
                  border-radius: 8px;
                  overflow: hidden;
                  width: 280px;
                  display: none;
                }
                .music-player.visible {
                  display: block;
                }
                .player-header {
                  padding: 10px;
                  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .player-content {
                  width: 100%;
                }
                .youtube-iframe {
                  width: 100%;
                  height: 157.5px;
                  border: none;
                }
                @media (max-width: 768px) {
                  .music-player-container {
                    top: 10px;
                    right: 10px;
                  }
                  .music-icon {
                    top: 10px;
                    right: 10px;
                    padding: 8px;
                    width: 35px;
                    height: 35px;
                  }
                  .music-icon svg {
                    width: 20px;
                    height: 20px;
                  }
                  .music-player {
                    top: 55px;
                    right: 10px;
                    width: 240px;
                  }
                  .youtube-iframe {
                    height: 135px;
                  }
                }
              </style>
              ${html}
            `);
            iframeDoc.close();

            // Add event listener for the "Make Your Own Essay" link
            const creditsLink = iframeDoc.querySelector('.credits');
            if (creditsLink) {
              creditsLink.addEventListener('click', (e) => {
                e.preventDefault();
                navigate('/');
              });
            }

            // Set initial state to minimized
            const musicPlayer = iframeDoc.querySelector('.music-player');
            const musicSvg = iframeDoc.querySelector('.music-svg') as SVGElement;
            const minusSvg = iframeDoc.querySelector('.minus-svg') as SVGElement;
            const youtubeIframe = iframeDoc.querySelector('.youtube-iframe') as HTMLIFrameElement;
            
            if (musicPlayer) {
              musicPlayer.classList.remove('visible');
            }
            if (musicSvg) {
              musicSvg.style.display = 'block';
            }
            if (minusSvg) {
              minusSvg.style.display = 'none';
            }
            if (youtubeIframe) {
              const currentSrc = youtubeIframe.src;
              const separator = currentSrc.includes('?') ? '&' : '?';
              youtubeIframe.src = `${currentSrc}${separator}autoplay=1&enablejsapi=1&playsinline=1&controls=1&rel=0`;
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load essay");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEssay();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="view-essay-container">
        <div className="loading">Loading essay...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-essay-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="view-essay-container" style={{
      overflow: 'hidden',
      height: '100vh',
      width: '100%'
    }}>
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          backgroundColor: '#0a0a0a',
          overflow: 'hidden'
        }}
        title="Essay Content"
      />
    </div>
  );
};

export default ViewEssay; 