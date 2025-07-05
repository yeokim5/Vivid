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
    // For mobile compatibility, we'll use a simpler approach
    setTimeout(() => {
      // Check if we're on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isInAppBrowser = /FBAN|FBAV|Instagram|Line|Pinterest|wv/.test(
        navigator.userAgent
      );

      // Get the video ID from the src
      let videoId = "";
      const srcUrl = youtubeIframe.src;
      if (srcUrl.includes("embed/")) {
        videoId = srcUrl.split("embed/")[1].split("?")[0];
      }

      // Create a fallback container next to the iframe
      const playerContent = youtubeIframe.parentElement;
      if (playerContent && !playerContent.querySelector(".youtube-fallback")) {
        const fallbackDiv = document.createElement("div");
        fallbackDiv.className = "youtube-fallback";
        fallbackDiv.style.display = "none";
        fallbackDiv.style.textAlign = "center";
        fallbackDiv.style.padding = "10px";
        fallbackDiv.style.marginTop = "10px";
        fallbackDiv.style.color = "#fff";
        fallbackDiv.innerHTML = `
          <p>Video not playing? Try these options:</p>
          <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" style="color: #fff; background: rgba(255,0,0,0.7); padding: 8px 12px; border-radius: 4px; text-decoration: none; display: inline-block; margin: 5px;">
            Open in YouTube
          </a>
        `;
        playerContent.appendChild(fallbackDiv);
      }

      if (isMobile || isInAppBrowser) {
        // On mobile or in-app browsers, add a timeout to check if video loads
        let videoLoaded = false;

        // Try to detect if the video is actually playing
        const checkVideoPlayback = () => {
          // If we're in an in-app browser, show fallback immediately
          if (isInAppBrowser) {
            const fallback = document.querySelector(".youtube-fallback");
            if (fallback) fallback.style.display = "block";
            return;
          }

          // For regular mobile browsers, check if iframe is empty or showing an error
          try {
            // Try to access iframe content - if blocked, it will throw an error
            const iframeDoc =
              youtubeIframe.contentDocument ||
              youtubeIframe.contentWindow?.document;
            if (!iframeDoc) {
              // Can't access iframe content - likely blocked
              const fallback = document.querySelector(".youtube-fallback");
              if (fallback) fallback.style.display = "block";
            }
          } catch (e) {
            // Cross-origin error - can't check directly
            // Instead, check if iframe has a reasonable height
            if (youtubeIframe.offsetHeight < 50) {
              const fallback = document.querySelector(".youtube-fallback");
              if (fallback) fallback.style.display = "block";
            }
          }
        };

        // Check after a delay to allow video to load
        setTimeout(checkVideoPlayback, 3000);

        // On mobile, use a clean URL without parameters
        if (youtubeIframe.src.includes("?")) {
          youtubeIframe.src = youtubeIframe.src.split("?")[0];
        }
      } else {
        // On desktop, we can use autoplay parameters
        const currentSrc = youtubeIframe.src;
        if (currentSrc && !currentSrc.includes("autoplay=1")) {
          const separator = currentSrc.includes("?") ? "&" : "?";
          youtubeIframe.src = `${currentSrc}${separator}autoplay=1&rel=0`;
        }
      }
    }, 1000);
  }
});
