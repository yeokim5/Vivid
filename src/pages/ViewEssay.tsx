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
        const viewedEssays = JSON.parse(localStorage.getItem('viewedEssays') || '{}');
        const hasViewed = viewedEssays[id || ''];

        // Fetch the essay content
        const response = await fetch(`${API_URL}/essays/${id}/render`);
        if (!response.ok) {
          throw new Error("Failed to fetch essay");
        }
        const html = await response.text();

        // If this is the first view, increment the view count
        if (!hasViewed && id) {
          try {
            await fetch(`${API_URL}/essays/${id}/view`, {
              method: 'POST'
            });
            // Mark this essay as viewed by this user
            viewedEssays[id] = true;
            localStorage.setItem('viewedEssays', JSON.stringify(viewedEssays));
          } catch (error) {
            console.error("Failed to increment view count:", error);
          }
        }

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