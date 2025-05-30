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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (iframeDoc) {
        try {
          iframeDoc.open();
          iframeDoc.write(html);
          iframeDoc.close();

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

          onLoad();
        } catch (err) {
          console.error("Error loading essay content:", err);
          setError("Failed to load essay content. Please try refreshing the page.");
        }
      }
    }
  }, [html, navigate, onLoad]);

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Refresh Page</button>
      </div>
    );
  }

  return (
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
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
    />
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
      width: '100%'
    }}>
      <ErrorBoundary>
        {html && <EssayIframe html={html} onLoad={() => setLoading(false)} />}
      </ErrorBoundary>
    </div>
  );
};

export default ViewEssay; 