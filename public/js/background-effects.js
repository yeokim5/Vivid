// Background effects initialization
document.addEventListener('DOMContentLoaded', function() {
  // Wait for the page to finish loading
  window.addEventListener('load', function() {
    initBackgroundEffect(backgroundEffect);
  });
});

/**
 * Initialize the selected background effect
 * @param {string} effectType - The type of effect to initialize
 */
function initBackgroundEffect(effectType) {
  if (!effectType || effectType === 'none') return;
  
  // Remove any existing effect containers
  const existingEffects = document.querySelectorAll('.background-effect-container');
  existingEffects.forEach(el => el.remove());
  
  // Create the effect container
  const effectContainer = document.createElement('div');
  effectContainer.className = 'background-effect-container';
  
  // Add specific effect implementation
  switch (effectType) {
    case 'blob':
      createBlobEffect(effectContainer);
      break;
    case 'firefly':
      createFireflyEffect(effectContainer);
      break;
    case 'particles':
      createParticlesEffect(effectContainer);
      break;
    case 'gradient':
      createGradientEffect(effectContainer);
      break;
  }
  
  // Add the effect container to the body
  document.body.appendChild(effectContainer);
}

/**
 * Create a blob animation with glassmorphism effect
 * @param {HTMLElement} container - The container element
 */
function createBlobEffect(container) {
  container.innerHTML = `
    <style>
      .background-effect-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
        backdrop-filter: blur(10px);
      }
      
      .blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(40px);
        opacity: 0.4;
        animation: blob-float 20s infinite;
      }
      
      @keyframes blob-float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(50px, 50px) scale(1.2); }
        50% { transform: translate(100px, -50px) scale(0.8); }
        75% { transform: translate(-50px, 50px) scale(1.1); }
      }
    </style>
  `;
  
  // Create multiple blobs with different colors, sizes, and positions
  const colors = [
    'rgba(255, 94, 98, 0.7)', 
    'rgba(255, 153, 102, 0.7)', 
    'rgba(110, 72, 170, 0.7)', 
    'rgba(157, 80, 187, 0.7)',
    'rgba(0, 201, 255, 0.7)'
  ];
  
  for (let i = 0; i < 5; i++) {
    const blob = document.createElement('div');
    blob.className = 'blob';
    
    // Randomize blob properties
    const size = Math.random() * 300 + 100;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = Math.random() * -20;
    const duration = Math.random() * 10 + 15;
    
    blob.style.width = `${size}px`;
    blob.style.height = `${size}px`;
    blob.style.left = `${left}%`;
    blob.style.top = `${top}%`;
    blob.style.background = colors[i % colors.length];
    blob.style.animationDelay = `${delay}s`;
    blob.style.animationDuration = `${duration}s`;
    
    container.appendChild(blob);
  }
}

/**
 * Create a firefly-like particles effect
 * @param {HTMLElement} container - The container element
 */
function createFireflyEffect(container) {
  container.innerHTML = `
    <style>
      .background-effect-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
      }
      
      .firefly {
        position: absolute;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        background: #fff;
        box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
        opacity: 0;
        animation: firefly linear infinite;
      }
      
      @keyframes firefly {
        0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.2); }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { opacity: 0; transform: translateY(-100px) translateX(100px) scale(1); }
      }
    </style>
  `;
  
  // Create multiple fireflies
  for (let i = 0; i < 50; i++) {
    const firefly = document.createElement('div');
    firefly.className = 'firefly';
    
    // Randomize firefly properties
    const size = Math.random() * 2 + 1;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const duration = Math.random() * 6 + 4;
    const delay = Math.random() * -10;
    
    firefly.style.width = `${size}px`;
    firefly.style.height = `${size}px`;
    firefly.style.left = `${left}%`;
    firefly.style.top = `${top}%`;
    firefly.style.animationDuration = `${duration}s`;
    firefly.style.animationDelay = `${delay}s`;
    
    // Alternate between yellow and white for more realistic firefly effect
    if (i % 2 === 0) {
      firefly.style.background = '#ffbb00';
      firefly.style.boxShadow = '0 0 10px 2px rgba(255, 187, 0, 0.8)';
    }
    
    container.appendChild(firefly);
  }
}

/**
 * Create a floating particles effect
 * @param {HTMLElement} container - The container element
 */
function createParticlesEffect(container) {
  container.innerHTML = `
    <style>
      .background-effect-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
      }
      
      .particle {
        position: absolute;
        border-radius: 50%;
        opacity: 0.6;
        animation: float linear infinite;
        bottom: -20px;
      }
      
      @keyframes float {
        0% { transform: translateY(0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.6; }
        90% { opacity: 0.6; }
        100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
      }
    </style>
  `;
  
  // Particle colors
  const colors = [
    '#ffffff', // White
    '#7f7fd5', // Purple
    '#86a8e7', // Blue
    '#91eae4'  // Cyan
  ];
  
  // Create multiple particles
  for (let i = 0; i < 80; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Randomize particle properties
    const size = Math.random() * 5 + 1;
    const left = Math.random() * 100;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * -20;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.background = color;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;
    
    container.appendChild(particle);
  }
}

/**
 * Create a gradient/aurora animation
 * @param {HTMLElement} container - The container element
 */
function createGradientEffect(container) {
  container.innerHTML = `
    <style>
      .background-effect-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
      }
      
      .gradient-bg {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
        background-size: 400% 400%;
        animation: gradient 15s ease infinite;
        opacity: 0.5;
      }
      
      @keyframes gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    </style>
  `;
  
  const gradientBg = document.createElement('div');
  gradientBg.className = 'gradient-bg';
  container.appendChild(gradientBg);
} 