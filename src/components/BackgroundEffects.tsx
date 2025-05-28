import React, { useEffect, useRef } from 'react';
import '../styles/BackgroundEffects.css';

interface BackgroundEffect {
  id: string;
  name: string;
  description: string;
  previewComponent: React.ReactNode;
}

interface BackgroundEffectsProps {
  selectedEffect: string;
  onSelectEffect: (effectId: string) => void;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({
  selectedEffect,
  onSelectEffect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  // List of available background effects
  const backgroundEffects: BackgroundEffect[] = [
    {
      id: 'none',
      name: 'None',
      description: 'No background effect',
      previewComponent: <div className="preview-none">No Effect</div>
    },
    {
      id: 'firefly',
      name: 'Firefly Particles',
      description: 'Light particles that resemble fireflies',
      previewComponent: <div className="preview-firefly">{Array(20).fill(0).map((_, i) => <div key={i} className="particle" style={{left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`}}></div>)}</div>
    },
    {
      id: 'particles',
      name: 'Floating Particles',
      description: 'Cool looking particles that float around',
      previewComponent: <div className="preview-particles">{Array(25).fill(0).map((_, i) => <div key={i} className="particle" style={{left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`}}></div>)}</div>
    }
  ];

  // Canvas-based animations
  useEffect(() => {
    if (selectedEffect === 'particles' || selectedEffect === 'waves' || selectedEffect === 'gradient') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      const resizeCanvas = () => {
        if (canvas) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      let animationId: number;

      if (selectedEffect === 'particles') {
        // Particles effect
        const particles: {
          x: number;
          y: number;
          size: number;
          speedX: number;
          speedY: number;
          color: string;
          opacity: number;
        }[] = [];

        const colors = ['#5d5fe2', '#9867f0', '#ff6b8b', '#ffffff'];
        
        // Create particles
        for (let i = 0; i < 100; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 5 + 1,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.5 + 0.1
          });
        }

        const drawParticles = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
            ctx.fill();
            
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Boundary check
            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
          });
          
          animationId = requestAnimationFrame(drawParticles);
        };
        
        drawParticles();
      } else if (selectedEffect === 'waves') {
        // Waves effect
        let angle = 0;
        
        const drawWaves = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Set gradient background
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, 'rgba(93, 95, 226, 0.2)');
          gradient.addColorStop(1, 'rgba(152, 103, 240, 0.2)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw multiple waves
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            
            const waveHeight = 50 - i * 10;
            const waveLength = 0.01 - i * 0.002;
            const speed = 0.05 + i * 0.02;
            const opacity = 0.3 - i * 0.1;
            const colors = ['#5d5fe2', '#9867f0', '#ff6b8b'];
            
            ctx.moveTo(0, canvas.height / 2);
            
            for (let x = 0; x < canvas.width; x++) {
              const y = Math.sin(x * waveLength + angle * speed) * waveHeight + canvas.height / 2;
              ctx.lineTo(x, y);
            }
            
            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            
            const waveGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            waveGradient.addColorStop(0, colors[i] + '80');
            waveGradient.addColorStop(0.5, colors[(i + 1) % 3] + '80');
            waveGradient.addColorStop(1, colors[i] + '80');
            
            ctx.fillStyle = waveGradient;
            ctx.globalAlpha = opacity;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          
          angle += 0.01;
          animationId = requestAnimationFrame(drawWaves);
        };
        
        drawWaves();
      } else if (selectedEffect === 'gradient') {
        // Animated gradient effect
        let hue = 0;
        
        const drawGradient = () => {
          // Create gradient that shifts over time
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          
          // Use base colors but shift hue slightly
          const hue1 = (hue) % 360;
          const hue2 = (hue + 60) % 360;
          const hue3 = (hue + 120) % 360;
          
          gradient.addColorStop(0, `hsla(${hue1}, 70%, 60%, 0.2)`);
          gradient.addColorStop(0.5, `hsla(${hue2}, 70%, 50%, 0.2)`);
          gradient.addColorStop(1, `hsla(${hue3}, 70%, 60%, 0.2)`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          hue = (hue + 0.2) % 360;
          animationId = requestAnimationFrame(drawGradient);
        };
        
        drawGradient();
      }

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationId);
      };
    }
  }, [selectedEffect]);

  // DOM-based animations
  useEffect(() => {
    if (selectedEffect === 'bubbles' && particlesRef.current) {
      const container = particlesRef.current;
      container.innerHTML = '';
      
      // Create bubbles
      for (let i = 0; i < 40; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        // Random properties
        const size = Math.random() * 60 + 20;
        const left = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        const opacity = Math.random() * 0.3 + 0.1;
        
        // Apply styles
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${left}%`;
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.animationDelay = `${delay}s`;
        bubble.style.opacity = opacity.toString();
        
        container.appendChild(bubble);
      }
    }
    
    if (selectedEffect === 'geometric' && particlesRef.current) {
      const container = particlesRef.current;
      container.innerHTML = '';
      
      const shapes = ['triangle', 'square', 'circle', 'pentagon', 'hexagon'];
      
      // Create shapes
      for (let i = 0; i < 30; i++) {
        const shape = document.createElement('div');
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        
        shape.classList.add('geometric-shape', shapeType);
        
        // Random properties
        const size = Math.random() * 40 + 10;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * 10;
        const opacity = Math.random() * 0.3 + 0.05;
        
        // Apply styles
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.left = `${left}%`;
        shape.style.top = `${top}%`;
        shape.style.animationDuration = `${duration}s`;
        shape.style.animationDelay = `${delay}s`;
        shape.style.opacity = opacity.toString();
        
        container.appendChild(shape);
      }
    }
  }, [selectedEffect]);

  // Determine which effect to render
  const renderBackgroundEffect = () => {
    switch (selectedEffect) {
      case 'particles':
      case 'waves':
      case 'gradient':
        return <canvas ref={canvasRef} className="background-canvas"></canvas>;
      case 'bubbles':
      case 'geometric':
        return <div ref={particlesRef} className="background-particles"></div>;
      default:
        return null;
    }
  };

  if (selectedEffect === 'none') return null;

  return (
    <div className={`background-effect ${selectedEffect}`}>
      {renderBackgroundEffect()}
    </div>
  );
};

export default BackgroundEffects; 