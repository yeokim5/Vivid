import React, { useEffect, useRef, useState } from 'react';
import '../styles/FluidBackground.css';

interface FluidBackgroundProps {
  complexity?: number;
}

const FluidBackground: React.FC<FluidBackgroundProps> = ({ complexity = 1 }) => {
  const sliderRef = useRef<HTMLInputElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [baseFrequency, setBaseFrequency] = useState(0.01);
  const [scale, setScale] = useState(300);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const isMobileDevice = width <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Animate the SVG filter properties with performance optimization for mobile
  useEffect(() => {
    let animationFrameId: number;
    let startTime = Date.now();
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000; // time in seconds
      
      // Less frequent updates for mobile devices
      const updateFrequency = isMobile ? 100 : 1; // Only update every 100ms on mobile
      
      if (isMobile && currentTime % updateFrequency !== 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      // Reduced animation intensity for mobile
      const intensityFactor = isMobile ? 0.3 : 1;
      
      // Animate baseFrequency with a subtle sine wave - reduced for mobile
      const newBaseFrequency = 0.01 + Math.sin(elapsed * 0.2) * 0.005 * intensityFactor;
      setBaseFrequency(newBaseFrequency);
      
      // Animate scale with a different frequency - reduced for mobile
      const newScale = 300 + Math.sin(elapsed * 0.1) * 20 * intensityFactor;
      setScale(newScale);
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);
  
  useEffect(() => {
    if (sliderRef.current && turbulenceRef.current) {
      // Reduce complexity on mobile devices
      const actualComplexity = isMobile ? Math.min(complexity, 2) : complexity;
      sliderRef.current.value = actualComplexity.toString();
      turbulenceRef.current.setAttribute('numOctaves', actualComplexity.toString());
    }
    
    // Initialize canvas and create fluid background effect
    const canvas = canvasRef.current;
    if (canvas && containerRef.current) {
      // Match canvas dimensions to container
      canvas.width = containerRef.current.offsetWidth;
      canvas.height = containerRef.current.offsetHeight;
      
      // Get canvas context
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Create background pattern
        const img = new Image();
        img.onload = () => {
          // Ensure the canvas is always updated with the container size
          const resizeObserver = new ResizeObserver(() => {
            if (canvas && containerRef.current) {
              canvas.width = containerRef.current.offsetWidth;
              canvas.height = containerRef.current.offsetHeight;
            }
          });
          
          if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
          }
        };
        img.src = getComputedStyle(document.documentElement).getPropertyValue('--bg-image').replace(/url\(['"]?([^'"]*)['"]?\)/i, '$1').trim();
      }
    }
  }, [complexity, isMobile]);
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (turbulenceRef.current) {
      turbulenceRef.current.setAttribute('numOctaves', value);
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
        <canvas ref={canvasRef} className={isMobile ? "mobile-optimization" : ""}></canvas>
      </div>

      {/* svg magic that makes this happen */}
      <svg>
        <filter id="swirl">
          <feTurbulence
            ref={turbulenceRef}
            baseFrequency={baseFrequency}
            numOctaves={isMobile ? Math.min(complexity, 2) : complexity}
            result="wrap"
            type="fractalNoise">
          </feTurbulence>
          
          <feDisplacementMap
            ref={displacementRef}
            id="liquid"
            className="liquid"
            in="SourceGraphic"
            in2="wrap"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="B">
          </feDisplacementMap>
        </filter>
      </svg>
    </div>
  );
};

export default FluidBackground; 