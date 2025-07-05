// Background Effects Script for Final Essays
// This should match the preview implementation exactly

/**
 * Initialize the selected background effect
 * @param {string} effectType - The type of effect to initialize
 */
function initBackgroundEffect(effectType) {
  if (!effectType || effectType === "none") return;

  // Remove any existing effect containers
  const existingEffects = document.querySelectorAll(
    ".background-effect-container"
  );
  existingEffects.forEach((el) => el.remove());

  // Create the effect container
  const effectContainer = document.createElement("div");
  effectContainer.className = "background-effect-container";

  // Add specific effect implementation
  switch (effectType) {
    case "heart":
      createHeartEffect(effectContainer);
      break;
    case "firefly":
      createFireflyEffect(effectContainer);
      break;
    case "particles":
      createParticlesEffect(effectContainer);
      break;
  }

  // Add the effect container to the body
  document.body.appendChild(effectContainer);
}

/**
 * Create heart effect that matches the preview exactly
 * @param {HTMLElement} container - The container element
 */
function createHeartEffect(container) {
  // Set up the container styles
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
    overflow: hidden;
  `;

  // Heart creation function
  const createHeart = () => {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.innerHTML = "💗";

    // Apply styles that match the preview
    heart.style.cssText = `
      position: fixed;
      font-size: 1.5rem;
      top: -1vh;
      transform: translateY(0);
      animation: fall 3s linear forwards;
      pointer-events: none;
      z-index: 5;
    `;

    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDuration = Math.random() * 2 + 3 + "s";

    container.appendChild(heart);

    // Remove heart after animation completes
    setTimeout(() => {
      if (heart.parentNode) {
        heart.remove();
      }
    }, 5000);
  };

  // Create initial hearts
  for (let i = 0; i < 10; i++) {
    setTimeout(() => createHeart(), Math.random() * 1500);
  }

  // Set interval to create hearts continuously
  setInterval(createHeart, 300);
}

/**
 * Create firefly effect that matches the original Sass/SCSS reference
 * @param {HTMLElement} container - The container element
 */
function createFireflyEffect(container) {
  // Set up the container styles
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
    overflow: hidden;
  `;

  // Create 15 fireflies as specified in the original Sass code
  for (let i = 0; i < 15; i++) {
    const firefly = document.createElement("div");
    firefly.classList.add("firefly");
    container.appendChild(firefly);
  }
}

/**
 * Create particles effect that matches the preview exactly
 * @param {HTMLElement} container - The container element
 */
function createParticlesEffect(container) {
  // Set up the container styles
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
    overflow: hidden;
  `;

  // Add the particles CSS styles that match the preview
  const style = document.createElement("style");
  style.textContent = `
    .particle {
      position: absolute;
      width: 6px;
      height: 6px;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      bottom: -20px;
      animation: preview-float 15s infinite;
      opacity: 0.6;
      box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
    }

    .particle:nth-child(3n) {
      width: 4px;
      height: 4px;
      background-color: rgba(93, 95, 226, 0.8);
      animation-duration: 25s;
      animation-delay: -5s;
      box-shadow: 0 0 5px rgba(93, 95, 226, 0.5);
    }

    .particle:nth-child(4n) {
      width: 8px;
      height: 8px;
      background-color: rgba(255, 107, 139, 0.8);
      animation-duration: 20s;
      animation-delay: -10s;
      box-shadow: 0 0 5px rgba(255, 107, 139, 0.5);
    }

    @keyframes preview-float {
      0% {
        transform: translateY(0);
        opacity: 0;
      }
      5% {
        opacity: 0.6;
      }
      95% {
        opacity: 0.6;
      }
      100% {
        transform: translateY(-100vh);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Create particles that match the preview implementation
  for (let i = 0; i < 25; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    // Position at the bottom like in the preview
    const left = Math.random() * 100;
    particle.style.left = `${left}%`;
    particle.style.bottom = "-20px";

    // Add random delay to make movement more natural
    const delay = Math.random() * 20;
    particle.style.animationDelay = `${delay}s`;

    container.appendChild(particle);
  }
}

// Initialize background effect when the script loads
document.addEventListener("DOMContentLoaded", function () {
  // Try to get the background effect from the global scope
  const backgroundEffect =
    window.essayBackgroundEffect || window.backgroundEffect;

  if (backgroundEffect && backgroundEffect !== "none") {
    // console.log("Initializing background effect:", backgroundEffect);
    initBackgroundEffect(backgroundEffect);
  }
});

// Make the function available globally for manual initialization
window.initBackgroundEffect = initBackgroundEffect;
