import React, { useEffect, useRef, useState } from "react";
import "../styles/FluidBackground.css";

interface FluidBackgroundProps {
  complexity?: number;
}

const FluidBackground: React.FC<FluidBackgroundProps> = ({
  complexity = 1,
}) => {
  const sliderRef = useRef<HTMLInputElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [baseFrequency, setBaseFrequency] = useState(0.01);
  const [scale, setScale] = useState(300);
  const [isMobile, setIsMobile] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  // Performance monitoring
  const frameTimeRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const performanceCheckRef = useRef<number>(0);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      const isTouchDevice = "ontouchstart" in window;

      setIsMobile(isMobileDevice || (isSmallScreen && isTouchDevice));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Performance monitoring
  useEffect(() => {
    const checkPerformance = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTimeRef.current;

      frameTimeRef.current.push(frameTime);

      // Keep only last 60 frame times (1 second of data at 60fps)
      if (frameTimeRef.current.length > 60) {
        frameTimeRef.current.shift();
      }

      // Check performance every 2 seconds
      if (
        frameTimeRef.current.length >= 30 &&
        performanceCheckRef.current++ % 120 === 0
      ) {
        const avgFrameTime =
          frameTimeRef.current.reduce((sum, time) => sum + time, 0) /
          frameTimeRef.current.length;
        const fps = 1000 / avgFrameTime;

        // If average FPS is below 45, consider it low performance
        // If on mobile and FPS is below 30, definitely low performance
        const fpsThreshold = isMobile ? 30 : 45;
        const isCurrentlyLowPerf = fps < fpsThreshold;

        if (isCurrentlyLowPerf !== isLowPerformance) {
          setIsLowPerformance(isCurrentlyLowPerf);
          console.log(
            `FluidBackground: Performance ${
              isCurrentlyLowPerf ? "degraded" : "improved"
            } (${fps.toFixed(1)} FPS)`
          );
        }
      }

      lastFrameTimeRef.current = currentTime;
    };

    // Start performance monitoring
    const monitoringInterval = setInterval(checkPerformance, 16); // Check every frame

    return () => clearInterval(monitoringInterval);
  }, [isMobile, isLowPerformance]);

  // Animate the SVG filter properties - simplified for mobile
  useEffect(() => {
    let animationFrameId: number;
    let startTime = Date.now();
    let lastUpdate = 0;

    const animate = (currentTime: number) => {
      // Adaptive update intervals based on performance
      let updateInterval = 16; // Default 60fps

      if (isLowPerformance) {
        updateInterval = 200; // 5fps for low performance
      } else if (isMobile) {
        updateInterval = 100; // 10fps for mobile
      }

      if (currentTime - lastUpdate < updateInterval) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      lastUpdate = currentTime;
      const elapsed = (currentTime - startTime) / 1000;

      if (isLowPerformance) {
        // Ultra-simplified animation for low performance devices
        const intensityFactor = 0.1; // Minimal animation
        const newBaseFrequency =
          0.005 + Math.sin(elapsed * 0.05) * 0.001 * intensityFactor;
        const newScale = 150 + Math.sin(elapsed * 0.025) * 5 * intensityFactor;

        setBaseFrequency(newBaseFrequency);
        setScale(newScale);
      } else if (isMobile) {
        // Simplified mobile animation - much less intensive
        const intensityFactor = 0.3; // Reduce intensity by 70%
        const newBaseFrequency =
          0.008 + Math.sin(elapsed * 0.1) * 0.002 * intensityFactor;
        const newScale = 200 + Math.sin(elapsed * 0.05) * 10 * intensityFactor;

        setBaseFrequency(newBaseFrequency);
        setScale(newScale);
      } else {
        // Full desktop animation
        const intensityFactor = 1.0;
        const newBaseFrequency =
          0.01 + Math.sin(elapsed * 0.2) * 0.005 * intensityFactor;
        const newScale = 300 + Math.sin(elapsed * 0.1) * 20 * intensityFactor;

        setBaseFrequency(newBaseFrequency);
        setScale(newScale);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, isLowPerformance]);

  // Set up canvas and resize observer
  useEffect(() => {
    if (sliderRef.current && turbulenceRef.current) {
      // Adaptive complexity based on performance
      let effectiveComplexity = complexity;

      if (isLowPerformance) {
        effectiveComplexity = Math.max(1, complexity - 2); // Reduce by 2 for low performance
      } else if (isMobile) {
        effectiveComplexity = Math.max(1, complexity - 1); // Reduce by 1 for mobile
      }

      sliderRef.current.value = effectiveComplexity.toString();
      turbulenceRef.current.setAttribute(
        "numOctaves",
        effectiveComplexity.toString()
      );
    }

    // Initialize canvas and create fluid background effect
    const canvas = canvasRef.current;
    if (canvas && containerRef.current) {
      // Match canvas dimensions to container
      const updateCanvasSize = () => {
        if (canvas && containerRef.current) {
          canvas.width = containerRef.current.offsetWidth;
          canvas.height = containerRef.current.offsetHeight;
        }
      };

      // Initial size
      updateCanvasSize();

      // Create resize observer with debounce to prevent loop
      if (!resizeObserverRef.current) {
        let resizeTimeout: number | null = null;
        let debounceDelay = 100;

        if (isLowPerformance) {
          debounceDelay = 500; // Extra long debounce for low performance
        } else if (isMobile) {
          debounceDelay = 250; // Longer debounce on mobile
        }

        resizeObserverRef.current = new ResizeObserver((entries) => {
          // Debounce resize events
          if (resizeTimeout) {
            window.clearTimeout(resizeTimeout);
          }

          resizeTimeout = window.setTimeout(() => {
            updateCanvasSize();
          }, debounceDelay);
        });

        resizeObserverRef.current.observe(containerRef.current);
      }

      // Get canvas context
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Create background pattern
        const img = new Image();
        img.onload = () => {
          // Pattern setup code goes here if needed
        };
        img.src = getComputedStyle(document.documentElement)
          .getPropertyValue("--bg-image")
          .replace(/url\(['"]?([^'"]*)['"]?\)/i, "$1")
          .trim();
      }
    }

    // Cleanup function
    return () => {
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
  }, [complexity, isMobile, isLowPerformance]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (turbulenceRef.current) {
      turbulenceRef.current.setAttribute("numOctaves", value);
    }
  };

  // Determine CSS classes based on performance
  const getBackgroundClasses = () => {
    const classes = ["fluid-background"];

    if (isMobile) {
      classes.push("mobile-optimized");
    }

    if (isLowPerformance) {
      classes.push("low-performance");
    }

    return classes.join(" ");
  };

  const getCanvasClasses = () => {
    const classes = ["consistent-rendering"];

    if (isMobile) {
      classes.push("mobile-canvas");
    }

    if (isLowPerformance) {
      classes.push("low-performance-canvas");
    }

    return classes.join(" ");
  };

  // Calculate effective complexity for SVG
  const getEffectiveComplexity = () => {
    let effectiveComplexity = complexity;

    if (isLowPerformance) {
      effectiveComplexity = Math.max(1, complexity - 2);
    } else if (isMobile) {
      effectiveComplexity = Math.max(1, complexity - 1);
    }

    return effectiveComplexity;
  };

  return (
    <div className={getBackgroundClasses()}>
      {/* The control slider */}
      <div id="controls">
        <p>Complexity</p>
        <input
          type="range"
          id="rangeSlider"
          min="0"
          max="5"
          defaultValue={complexity.toString()}
          ref={sliderRef}
          onChange={handleSliderChange}
        />
        {/* Performance indicator for debugging */}
        {process.env.NODE_ENV === "development" && (
          <div style={{ fontSize: "12px", marginTop: "5px" }}>
            Mode:{" "}
            {isLowPerformance ? "Low Perf" : isMobile ? "Mobile" : "Desktop"}
          </div>
        )}
      </div>

      {/* The background itself */}
      <div id="container" ref={containerRef}>
        <canvas ref={canvasRef} className={getCanvasClasses()} />
      </div>

      {/* svg magic that makes this happen */}
      <svg>
        <filter id="swirl">
          <feTurbulence
            ref={turbulenceRef}
            baseFrequency={baseFrequency}
            numOctaves={getEffectiveComplexity()}
            result="wrap"
            type="fractalNoise"
          />

          <feDisplacementMap
            ref={displacementRef}
            id="liquid"
            className="liquid"
            in="SourceGraphic"
            in2="wrap"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="B"
          />
        </filter>
      </svg>
    </div>
  );
};

export default FluidBackground;
