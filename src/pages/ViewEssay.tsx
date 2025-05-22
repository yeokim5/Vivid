import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

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

  useEffect(() => {
    const fetchEssay = async () => {
      try {
        console.log("API_URL:", API_URL);
        console.log("id:", id);
        const url = `${API_URL}/essays/${id}/render`;
        console.log("Fetching from URL:", url);
        
        const response = await fetch(url);
        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to fetch essay: ${response.status} ${errorText}`);
        }
        
        const content = await response.text();
        console.log("Received content length:", content.length);
        console.log("Content type:", response.headers.get("content-type"));
        
        if (!content) {
          throw new Error("Received empty content from server");
        }

        // Write the content to the iframe
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(content);
            iframeDoc.close();
          }
        }
      } catch (err) {
        console.error("Error fetching essay:", err);
        setError(err instanceof Error ? err.message : "Failed to load essay");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEssay();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="loading" style={{ 
        backgroundColor: '#0a0a0a',
        color: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p>Loading essay...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error" style={{ 
        backgroundColor: '#0a0a0a',
        color: '#f8f9fa',
        minHeight: '100vh',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p>Error: {error}</p>
        <p>Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          backgroundColor: '#0a0a0a'
        }}
        title="Essay Content"
      />
    </div>
  );
};

export default ViewEssay; 