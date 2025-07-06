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

  // Animate the SVG filter properties consistently across devices
  useEffect(() => {
    let animationFrameId: number;
    let startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000; // time in seconds

      // Consistent animation intensity for all devices
      const intensityFactor = 1.0;

      // Animate baseFrequency with a subtle sine wave
      const newBaseFrequency =
        0.01 + Math.sin(elapsed * 0.2) * 0.005 * intensityFactor;
      setBaseFrequency(newBaseFrequency);

      // Animate scale with a different frequency
      const newScale = 300 + Math.sin(elapsed * 0.1) * 20 * intensityFactor;
      setScale(newScale);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Set up canvas and resize observer
  useEffect(() => {
    if (sliderRef.current && turbulenceRef.current) {
      // Use consistent complexity across all devices
      sliderRef.current.value = complexity.toString();
      turbulenceRef.current.setAttribute("numOctaves", complexity.toString());
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

        resizeObserverRef.current = new ResizeObserver((entries) => {
          // Debounce resize events
          if (resizeTimeout) {
            window.clearTimeout(resizeTimeout);
          }

          resizeTimeout = window.setTimeout(() => {
            updateCanvasSize();
          }, 100);
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
  }, [complexity]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (turbulenceRef.current) {
      turbulenceRef.current.setAttribute("numOctaves", value);
    }
  };

  return (
    <div className="fluid-background">
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
      </div>

      {/* The background itself */}
      <div id="container" ref={containerRef}>
        <canvas ref={canvasRef} className="consistent-rendering"></canvas>
      </div>

      {/* svg magic that makes this happen */}
      <svg>
        <filter id="swirl">
          <feTurbulence
            ref={turbulenceRef}
            baseFrequency={baseFrequency}
            numOctaves={complexity}
            result="wrap"
            type="fractalNoise"
          ></feTurbulence>

          <feDisplacementMap
            ref={displacementRef}
            id="liquid"
            className="liquid"
            in="SourceGraphic"
            in2="wrap"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="B"
          ></feDisplacementMap>
        </filter>
      </svg>
    </div>
  );
};

export default FluidBackground;
