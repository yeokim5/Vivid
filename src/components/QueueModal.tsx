import React, { useState, useEffect, useRef } from "react";
import { createApiUrl, getAuthHeaders } from "../config/api";
import "../styles/QueueModal.css";

type HeadersInit = Record<string, string> | Headers;

interface QueueStatus {
  position: number;
  totalInQueue: number;
  estimatedWaitTime: number;
  isProcessing: boolean;
  inQueue: boolean;
}

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReadyToProcess: () => void;
  onRejoinQueue: () => void;
  title: string;
  content: string;
  queueItemId: string | null;
}

const QueueModal: React.FC<QueueModalProps> = ({
  isOpen,
  onClose,
  onReadyToProcess,
  onRejoinQueue,
  title,
  content,
  queueItemId,
}) => {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const hasTriggeredStartRef = useRef(false);

  // Format time in minutes and seconds
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.ceil(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Check queue status
  const checkQueueStatus = async () => {
    try {
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        setError("Authentication required");
        return;
      }

      if (!queueItemId) {
        setError("Queue item ID not found");
        return;
      }

      const response = await fetch(
        createApiUrl(`/queue/status?queueItemId=${queueItemId}`),
        {
          headers: authHeaders as HeadersInit,
        }
      );

      const data = await response.json();
      console.log("[QUEUE MODAL] Queue status response:", data);

      if (response.status === 404 || (data.data && !data.data.inQueue)) {
        // Queue item not found - likely processed or removed
        console.log("[QUEUE MODAL] Queue item not found, rejoining queue");
        setError("Your queue position was lost. Rejoining queue...");
        setTimeout(() => {
          setError("");
          onRejoinQueue(); // Notify parent to rejoin the queue
        }, 2000);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to check queue status");
      }

      if (data.success && data.data) {
        setQueueStatus(data.data);

        // If user is at position 1 and not currently processing, check if they can start
        if (data.data.position === 1 && !data.data.isProcessing) {
          console.log(
            "[QUEUE MODAL] User is first in queue. Estimated wait time:",
            data.data.estimatedWaitTime
          );

          // Only proceed if estimated wait time is very low (less than 1 second)
          // This adds extra buffer to prevent rate limit conflicts
          if (
            data.data.estimatedWaitTime < 1000 &&
            !hasTriggeredStartRef.current
          ) {
            console.log(
              "[QUEUE MODAL] Ready to start processing - triggering once"
            );
            hasTriggeredStartRef.current = true; // Immediate update with ref
            setTimeout(() => onReadyToProcess(), 2000); // Wait 2 extra seconds to be safe
          } else {
            console.log(
              "[QUEUE MODAL] Waiting for rate limit:",
              Math.ceil(data.data.estimatedWaitTime / 1000),
              "seconds"
            );
          }
        }
      } else {
        console.error("[QUEUE MODAL] Invalid queue status response:", data);
        setError(data.message || "Invalid queue status response");
      }
    } catch (err) {
      console.error("Error checking queue status:", err);
      setError("Failed to check queue status. Retrying...");
      // Retry after 5 seconds
      setTimeout(() => {
        if (queueItemId) {
          checkQueueStatus();
        }
      }, 5000);
    }
  };

  // Leave queue
  const leaveQueue = async () => {
    setIsLoading(true);
    try {
      const authHeaders = getAuthHeaders();

      if (!queueItemId) {
        setError("Queue item ID not found");
        setIsLoading(false);
        return;
      }

      const response = await fetch(createApiUrl("/queue/leave"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders as HeadersInit),
        },
        body: JSON.stringify({ queueItemId }),
      });

      if (response.ok) {
        onClose();
      }
    } catch (err) {
      console.error("Error leaving queue:", err);
      setError("Failed to leave queue");
    } finally {
      setIsLoading(false);
    }
  };

  // Join queue
  const joinQueue = async () => {
    setIsLoading(true);
    setError("");

    try {
      const authHeaders = getAuthHeaders();
      const response = await fetch(createApiUrl("/queue/check"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeaders as HeadersInit),
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();
      console.log("[QUEUE MODAL] Join queue response:", data);

      if (data.success && data.data) {
        if (data.data.canProcess) {
          // Can process immediately
          onReadyToProcess();
          return;
        }

        setQueueStatus(data.data);
      } else {
        console.error("[QUEUE MODAL] Failed to join queue:", data);
        setError(data.message || "Failed to join queue");
      }
    } catch (err) {
      console.error("Error joining queue:", err);
      setError("Failed to join queue");
    } finally {
      setIsLoading(false);
    }
  };

  // Update countdown
  useEffect(() => {
    if (queueStatus && queueStatus.estimatedWaitTime > 0) {
      setCountdown(queueStatus.estimatedWaitTime);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            // Only recheck status if we haven't triggered processing yet
            if (!hasTriggeredStartRef.current) {
              checkQueueStatus();
            }
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else if (queueStatus && queueStatus.estimatedWaitTime === -1) {
      // Special case: waiting for current processing to complete
      setCountdown(0);
    }
  }, [queueStatus?.estimatedWaitTime]);

  // Poll queue status periodically (but stop if processing has been triggered)
  useEffect(() => {
    if (
      isOpen &&
      queueStatus?.inQueue &&
      queueItemId &&
      !hasTriggeredStartRef.current
    ) {
      const interval = setInterval(checkQueueStatus, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, queueStatus?.inQueue, queueItemId]);

  // Check queue status when modal opens and reset trigger flag
  useEffect(() => {
    if (isOpen && !queueStatus && queueItemId) {
      checkQueueStatus();
      hasTriggeredStartRef.current = false; // Reset for new queue session
    }
  }, [isOpen, queueItemId]);

  // Debug logging
  useEffect(() => {
    if (queueStatus) {
      console.log("[QUEUE MODAL] Current status:", queueStatus);
    }
  }, [queueStatus]);

  if (!isOpen) return null;

  return (
    <div className="queue-modal-overlay">
      <div className="queue-modal">
        <div className="queue-modal-header">
          <h2>🕒 Queue Status</h2>
          <button
            className="queue-modal-close"
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="queue-modal-content">
          {error && <div className="queue-error">{error}</div>}

          {isLoading && !queueStatus && (
            <div className="queue-loading">
              <div className="loading-spinner"></div>
              <p>Checking your position...</p>
            </div>
          )}

          {queueStatus && queueStatus.inQueue && (
            <div className="queue-info">
              <div className="queue-position">
                <h3>Your Position in Queue</h3>
                <div className="position-display">
                  <span className="position-number">
                    {queueStatus.position}
                  </span>
                  <span className="position-total">
                    of {queueStatus.totalInQueue}
                  </span>
                </div>
              </div>

              <div className="queue-time">
                <h3>Estimated Wait Time</h3>
                <div className="time-display">
                  {queueStatus.estimatedWaitTime === -1 ? (
                    <span className="waiting">
                      Waiting for current essay to complete...
                    </span>
                  ) : countdown > 1000 ? (
                    <span className="countdown">{formatTime(countdown)}</span>
                  ) : queueStatus.position === 1 && countdown <= 1000 ? (
                    <span className="ready">Ready to start!</span>
                  ) : countdown > 0 ? (
                    <span className="countdown">{formatTime(countdown)}</span>
                  ) : (
                    <span className="ready">Almost ready!</span>
                  )}
                </div>
              </div>

              <div className="queue-explanation">
                <p>
                  <strong>Why the wait?</strong> Our image generation API allows
                  only one essay every 68 seconds to ensure the best quality
                  images and smooth processing for your essay.
                </p>
                <p>You'll be automatically notified when it's your turn!</p>
              </div>

              {queueStatus.position === 1 &&
                countdown <= 1000 &&
                queueStatus.estimatedWaitTime !== -1 &&
                !hasTriggeredStartRef.current && (
                  <div className="next-in-line">
                    <div className="next-indicator">
                      <span className="pulse-dot"></span>
                      You're next! Get ready...
                    </div>
                  </div>
                )}
            </div>
          )}

          {queueStatus && !queueStatus.inQueue && (
            <div className="queue-not-in-queue">
              <p>You're not currently in the queue.</p>
              <button
                className="join-queue-btn"
                onClick={joinQueue}
                disabled={isLoading}
              >
                {isLoading ? "Joining..." : "Join Queue"}
              </button>
            </div>
          )}
        </div>

        <div className="queue-modal-footer">
          <button
            className="leave-queue-btn"
            onClick={leaveQueue}
            disabled={isLoading}
          >
            {isLoading ? "Leaving..." : "Leave Queue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueModal;
