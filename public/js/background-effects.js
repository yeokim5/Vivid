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
 * Create firefly effect that exactly matches the preview implementation
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

  // Add the base firefly CSS styles that match the preview
  const style = document.createElement("style");
  style.textContent = `
    .firefly {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 0.4vw;
      height: 0.4vw;
      margin: -0.2vw 0 0 9.8vw;
      pointer-events: none;
      animation: ease 60s alternate infinite;
      z-index: 5;
    }

    .firefly::before,
    .firefly::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      transform-origin: -10vw;
    }

    .firefly::before {
      background: black;
      opacity: 0.4;
      animation: drift ease alternate infinite;
    }

    .firefly::after {
      background: white;
      opacity: 0;
      box-shadow: 0 0 0vw 0vw yellow;
      animation: drift ease alternate infinite, flash ease infinite;
    }

    @keyframes drift {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes flash {
      0%, 30%, 100% {
        opacity: 0;
        box-shadow: 0 0 0vw 0vw yellow;
      }
      5% {
        opacity: 1;
        box-shadow: 0 0 2vw 0.4vw yellow;
      }
    }
  `;
  document.head.appendChild(style);

  // Create fireflies that exactly match the preview implementation
  for (let i = 0; i < 15; i++) {
    const firefly = document.createElement("div");
    firefly.classList.add("firefly");

    // Position exactly like in the preview
    firefly.style.left = "50%";
    firefly.style.top = "50%";
    firefly.style.margin = "-0.2vw 0 0 9.8vw";

    // Generate random animation durations like in the preview
    const rotationSpeed = Math.floor(Math.random() * 10) + 8;
    const flashDuration = Math.floor(Math.random() * 3000) + 2000;
    const flashDelay = Math.floor(Math.random() * 2000) + 500;

    // Add the exact same nth-child styling as the preview
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .firefly:nth-child(${i + 1})::before {
        animation-duration: ${rotationSpeed}s;
      }
      .firefly:nth-child(${i + 1})::after {
        animation-duration: ${rotationSpeed}s, ${flashDuration}ms;
        animation-delay: 0ms, ${flashDelay}ms;
      }
    `;

    firefly.appendChild(styleElement);
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
    console.log("Initializing background effect:", backgroundEffect);
    initBackgroundEffect(backgroundEffect);
  }
});

// Make the function available globally for manual initialization
window.initBackgroundEffect = initBackgroundEffect;
