import React, { useState } from "react";
import "../styles/ImageCarousel.css";

interface ImageCarouselProps {
  images: string[];
  onSelectImage: (imageUrl: string) => void;
  prompt: string;
  onRetryLoad?: () => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  onSelectImage,
  prompt,
  onRetryLoad,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleSelectCurrent = () => {
    onSelectImage(images[currentIndex]);
  };

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  // Check if current image has failed to load
  const isCurrentImageFailed = failedImages[currentIndex];

  // Count valid images (those that haven't failed to load)
  const validImagesCount = images.length - Object.keys(failedImages).length;

  if (images.length === 0 || validImagesCount === 0) {
    return (
      <div className="no-images">
        <p>Image Loading..</p>
        {onRetryLoad && (
          <button className="retry-button" onClick={onRetryLoad}>
            Retry Loading Images
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="image-carousel">
      <div className="image-prompt">
        <h3>Choose an image that reflects this vibe:</h3>
        <p>{prompt}</p>
      </div>

      <div className="carousel-container">
        <button
          className="carousel-arrow prev-arrow"
          onClick={handlePrevious}
          aria-label="Previous image"
        >
          &#10094;
        </button>

        <div className="carousel-image-container">
          {isCurrentImageFailed ? (
            <div className="failed-image">
              <p>This image failed to load</p>
              <button className="next-image-button" onClick={handleNext}>
                Try Next Image
              </button>
            </div>
          ) : (
            <img
              src={images[currentIndex]}
              alt={`Option ${currentIndex + 1}`}
              className="carousel-image"
              onError={() => handleImageError(currentIndex)}
            />
          )}
          <div className="image-counter">
            {currentIndex + 1} / {images.length}
            {Object.keys(failedImages).length > 0 &&
              ` (${validImagesCount} valid)`}
          </div>
        </div>

        <button
          className="carousel-arrow next-arrow"
          onClick={handleNext}
          aria-label="Next image"
        >
          &#10095;
        </button>
      </div>

      {!isCurrentImageFailed && (
        <button className="select-image-button" onClick={handleSelectCurrent}>
          Select This Image
        </button>
      )}
    </div>
  );
};

export default ImageCarousel;
