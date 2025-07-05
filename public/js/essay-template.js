setTimeout(() => {
  const loading = document.querySelector(".loading");
  loading.classList.add("fade-out");
  setTimeout(() => loading.remove(), 500);
}, 1000);

// Quote animations on scroll
document.addEventListener("DOMContentLoaded", () => {
  // Animate quotes on scroll
  const quotes = document.querySelectorAll(".quote");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  quotes.forEach((quote) => {
    observer.observe(quote);
  });

  // Apply background images to sections
  Object.entries(backgroundImages).forEach(([id, url]) => {
    if (url && url.startsWith("http")) {
      // Only apply if it's a valid URL
      const element = document.getElementById(id);
      if (element) {
        element.style.backgroundImage = `url('${url}')`;
        // console.log(`Applied background image to ${id}: ${url}`);
      } else {
        // console.warn(`Element with id ${id} not found`);
      }
    } else if (url) {
      // console.warn(`Invalid background image URL for ${id}: ${url}`);
    } else {
      // console.log(`No background image provided for ${id}`);
    }
  });

  // Initialize background effects
  setTimeout(() => {
    const backgroundEffect =
      window.essayBackgroundEffect || window.backgroundEffect;
    if (backgroundEffect && backgroundEffect !== "none") {
      // console.log(
      //   "Essay template initializing background effect:",
      //   backgroundEffect
      // );

      // Make sure the background effects script is loaded
      if (typeof window.initBackgroundEffect === "function") {
        window.initBackgroundEffect(backgroundEffect);
      } else {
        // console.warn("Background effects script not loaded yet, retrying...");
        // Retry after a short delay
        setTimeout(() => {
          if (typeof window.initBackgroundEffect === "function") {
            window.initBackgroundEffect(backgroundEffect);
          } else {
            // console.error("Background effects script failed to load");
          }
        }, 1000);
      }
    }
  }, 1500);

  // Handle visibility of share and "Make Your Own" buttons based on current section
  const sections = document.querySelectorAll("section");
  const shareButton = document.querySelector(".share-button");
  const creditsButton = document.querySelector(".credits");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionClass = entry.target.className;
          // Show buttons only on the last section (section-9)
          if (sectionClass.includes("section-9")) {
            if (shareButton) {
              shareButton.style.opacity = "1";
              shareButton.style.visibility = "visible";
            }
            if (creditsButton) {
              creditsButton.style.opacity = "1";
              creditsButton.style.visibility = "visible";
            }
          } else {
            if (shareButton) {
              shareButton.style.opacity = "0";
              shareButton.style.visibility = "hidden";
            }
            if (creditsButton) {
              creditsButton.style.opacity = "0";
              creditsButton.style.visibility = "hidden";
            }
          }
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
});

// Sharing functionality
function shareCurrentPage() {
  if (navigator.share) {
    navigator
      .share({
        title: document.title,
        url: window.location.href,
      })
      .catch((error) => {
        /* console.log("Error sharing:", error) */
      });
  } else {
    // Fallback for browsers that don't support the Web Share API
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => alert("Link copied to clipboard!"))
      .catch((err) => {
        /* console.error("Failed to copy link:", err) */
      });
  }
}

// Music Player Functionality
document.addEventListener("DOMContentLoaded", () => {
  const musicIcon = document.getElementById("musicIcon");
  const musicPlayer = document.getElementById("musicPlayer");
  const musicSvg = musicIcon.querySelector(".music-svg");
  const minusSvg = musicIcon.querySelector(".minus-svg");
  const youtubeIframe = document.querySelector(".youtube-iframe");

  musicIcon.addEventListener("click", () => {
    const isVisible = musicPlayer.classList.contains("visible");
    if (isVisible) {
      musicPlayer.classList.remove("visible");
      musicSvg.style.display = "block";
      minusSvg.style.display = "none";
    } else {
      musicPlayer.classList.add("visible");
      musicSvg.style.display = "none";
      minusSvg.style.display = "block";
    }
  });

  // Ensure autoplay works - try to play the video after a short delay
  if (youtubeIframe) {
    setTimeout(() => {
      const currentSrc = youtubeIframe.src;
      if (currentSrc && !currentSrc.includes("autoplay=1")) {
        const separator = currentSrc.includes("?") ? "&" : "?";
        youtubeIframe.src = `${currentSrc}${separator}autoplay=1&enablejsapi=1&playsinline=1&controls=1&rel=0`;
      }
    }, 1500); // Wait a bit longer to ensure everything is loaded
  }
});
