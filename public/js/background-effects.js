// Background effects initialization
document.addEventListener('DOMContentLoaded', function() {
  // Wait for the page to finish loading
  window.addEventListener('load', function() {
    // Use the global backgroundEffect variable
    if (typeof window.backgroundEffect !== 'undefined') {
      initBackgroundEffect(window.backgroundEffect);
    } else {
      console.warn('Background effect not defined, defaulting to none');
      initBackgroundEffect('none');
    }
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
    case 'firefly':
      createFireflyEffect(effectContainer);
      break;
    case 'particles':
      createParticlesEffect(effectContainer);
      break;
  }
  
  // Add the effect container to the body
  document.body.appendChild(effectContainer);
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