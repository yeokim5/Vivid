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

// Essay iframe component
const EssayIframe: React.FC<{ html: string; onLoad: () => void }> = ({ html, onLoad }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        // First write a loading state
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  background-color: #0a0a0a;
                  color: #f8f9fa;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  font-family: system-ui, -apple-system, sans-serif;
                }
                .loading-container {
                  text-align: center;
                }
                .loading-spinner {
                  width: 50px;
                  height: 50px;
                  border: 3px solid #f8f9fa;
                  border-radius: 50%;
                  border-top-color: transparent;
                  animation: spin 1s linear infinite;
                  margin: 0 auto 20px;
                }
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              </style>
            </head>
            <body>
              <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading essay...</p>
              </div>
            </body>
          </html>
        `);
        iframeDoc.close();

        // Then load the actual content after a short delay
        setTimeout(() => {
          iframeDoc.open();
          iframeDoc.write(html);
          iframeDoc.close();

          // Add the styles after the document is initialized
          const styleElement = iframeDoc.createElement('style');
          styleElement.textContent = `
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: 100% !important;
              width: 100% !important;
              /* Hide scrollbar but keep scrolling */
              scrollbar-width: none !important; /* Firefox */
              -ms-overflow-style: none !important; /* IE and Edge */
            }
            html::-webkit-scrollbar, body::-webkit-scrollbar {
              display: none !important; /* Chrome, Safari, Opera */
            }
            #essay-container {
              height: 100vh !important;
              width: 100vw !important;
              /* Hide scrollbar but keep scrolling */
              scrollbar-width: none !important;
              -ms-overflow-style: none !important;
            }
            #essay-container::-webkit-scrollbar {
              display: none !important;
            }
            #essay-container section {
              height: 100vh !important;
              width: 100vw !important;
            }
          `;
          iframeDoc.head.appendChild(styleElement);

          // Setup event listeners
          const creditsLink = iframeDoc.querySelector('.credits');
          if (creditsLink) {
            creditsLink.addEventListener('click', (e) => {
              e.preventDefault();
              navigate('/');
            });
          }

          // Initialize music player state
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

          setIsIframeLoading(false);
          onLoad();
        }, 100); // Small delay to ensure smooth transition
      }
    }
  }, [html, navigate, onLoad]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          backgroundColor: '#0a0a0a',
          opacity: isIframeLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }}
        title="Essay Content"
      />
    </div>
  );
};

const ViewEssay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    const fetchEssay = async () => {
      if (!id) return;

      try {
        // Track view count
        const viewTrackingKey = 'viewedEssays';
        const now = Date.now();
        const viewedEssays = JSON.parse(localStorage.getItem(viewTrackingKey) || '{}');
        const lastView = viewedEssays[id];
        const hasRecentView = lastView && (now - lastView) < 24 * 60 * 60 * 1000; // 24 hours

        if (!hasRecentView) {
          try {
            const response = await fetch(`${API_URL}/essays/${id}/view`, {
              method: 'POST'
            });
            
            if (response.ok) {
              viewedEssays[id] = now;
              localStorage.setItem(viewTrackingKey, JSON.stringify(viewedEssays));
            }
          } catch (error) {
            console.error("Failed to increment view count:", error);
          }
        }

        // Fetch essay content
        const response = await fetch(`${API_URL}/essays/${id}/render`);
        if (!response.ok) {
          throw new Error("Failed to fetch essay");
        }
        const htmlContent = await response.text();
        setHtml(htmlContent);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load essay");
      } finally {
        setLoading(false);
      }
    };

    fetchEssay();
  }, [id]);

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
      width: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <ErrorBoundary>
        {html && <EssayIframe html={html} onLoad={() => setLoading(false)} />}
      </ErrorBoundary>
    </div>
  );
};

export default ViewEssay; 