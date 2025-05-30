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
    if (url && url.startsWith('http')) {  // Only apply if it's a valid URL
      const element = document.getElementById(id);
      if (element) {
        element.style.backgroundImage = `url('${url}')`;
      }
    }
  });
});

// Sharing functionality
function shareCurrentPage() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    })
    .catch(error => console.log('Error sharing:', error));
  } else {
    // Fallback for browsers that don't support the Web Share API
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied to clipboard!'))
      .catch(err => console.error('Failed to copy link:', err));
  }
}

// Music Player Functionality
document.addEventListener('DOMContentLoaded', () => {
  const musicIcon = document.getElementById('musicIcon');
  const musicPlayer = document.getElementById('musicPlayer');
  const musicSvg = musicIcon.querySelector('.music-svg');
  const minusSvg = musicIcon.querySelector('.minus-svg');

  musicIcon.addEventListener('click', () => {
    const isVisible = musicPlayer.classList.contains('visible');
    if (isVisible) {
      musicPlayer.classList.remove('visible');
      musicSvg.style.display = 'block';
      minusSvg.style.display = 'none';
    } else {
      musicPlayer.classList.add('visible');
      musicSvg.style.display = 'none';
      minusSvg.style.display = 'block';
    }
  });
}); 