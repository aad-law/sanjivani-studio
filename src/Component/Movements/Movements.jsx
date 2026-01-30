import React, { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Helmet } from "react-helmet-async";
import './Movements.css';

// Category descriptions
const categoryDescriptions = {
  "Wedding": {
    tagline: "Capture your special day with timeless elegance",
    description: "From intimate ceremonies to grand celebrations, we preserve every precious moment. Every wedding tells a unique story of love, tradition, and celebration. We capture the stolen glances, the joyful tears, and the moments that become cherished memories for generations."
  },
  "Birthday": {
    tagline: "Make every birthday unforgettable",
    description: "From the first candle to the hundredth, birthdays are magical moments of joy. We freeze these celebrations in time, capturing the laughter, surprises, and pure happiness."
  },
  "Corporate": {
    tagline: "Professional excellence captured",
    description: "Documentation of conferences, seminars, and business gatherings. Elevate your brand with stunning corporate imagery. From conferences to team portraits, we deliver polished visuals that speak volumes about your professional identity."
  },
  "Maternity": {
    tagline: "Celebrate the beauty of motherhood",
    description: "Pregnancy is a journey of transformation and wonder. Our maternity shoots celebrate the glow of motherhood with elegant, intimate portraits you'll treasure forever."
  },
  "Pre-Wedding": {
    tagline: "Tell your love story before the big day",
    description: "Before the vows, there's a beautiful story waiting to be told. Romantic, cinematic pre-wedding sessions at breathtaking locations capturing the romance, chemistry, and anticipation of your journey together."
  },
  "Portrait": {
    tagline: "Express yourself through stunning portraits",
    description: "Every face has a story. Professional headshots, lifestyle shots, or creative concepts that reveal character, emotion, and personality through carefully crafted images."
  },
  "Event": {
    tagline: "Moments Worth Remembering",
    description: "From festivals to private parties, we capture the energy, emotion, and excitement of your special events. We document events with an eye for candid moments and the energy that makes each occasion special."
  },
  "Baby": {
    tagline: "Tiny Moments, Big Memories",
    description: "Document the sacred moments of welcoming your little one with grace. Those precious early days pass so quickly. We capture the tender moments, tiny details, and pure innocence of your little one's first chapter."
  },
  "Family": {
    tagline: "Creating lasting memories",
    description: "Create beautiful family portraits that capture the love and connection you share. We freeze these precious moments in time for you to cherish forever."
  },
  "Fashion": {
    tagline: "Style and Personality",
    description: "Build your modeling portfolio with high-fashion editorial shoots that showcase your unique style and personality."
  },
  "Product": {
    tagline: "Showcase your brand",
    description: "Showcase your products with stunning commercial photography that drives sales and elevates your brand aesthetic."
  },
  "Engagement": {
    tagline: "The beginning of forever",
    description: "Celebrate your commitment with romantic engagement photography that marks the beginning of your journey together."
  }
};

const defaultDescription = {
  tagline: "Captured with Passion",
  description: "Every moment has its own magic. We bring our artistic vision and technical expertise to create stunning photographs that tell your unique story."
};

// Calculate aspect ratio from image dimensions
const calculateAspectRatio = (width, height) => {
  const ratio = width / height;
  const tolerance = 0.15;

  const ratios = [
    { name: '1:1', value: 1 / 1 },
    { name: '4:3', value: 4 / 3 },
    { name: '3:4', value: 3 / 4 },
    { name: '16:9', value: 16 / 9 },
    { name: '9:16', value: 9 / 16 },
    { name: '3:2', value: 3 / 2 },
    { name: '2:3', value: 2 / 3 },
    { name: '21:9', value: 21 / 9 },
    { name: '9:21', value: 9 / 21 },
  ];

  let closest = null;
  let minDiff = Infinity;

  for (const r of ratios) {
    const diff = Math.abs(ratio - r.value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = r;
    }
  }

  if (closest && minDiff <= tolerance) {
    return closest.name;
  }

  return null; // Return null for custom ratios, let CSS handle it naturally
};

// Cloudinary Optimization Helper
const getOptimizedUrl = (url, type = 'thumbnail') => {
  if (!url || !url.includes("cloudinary.com")) return url;

  // Base configuration for all images
  // f_auto: automatic format (WebP/AVIF)
  // q_auto: automatic quality
  // fl_progressive: progressive JPEG loading
  const baseParams = "f_auto,fl_progressive";

  if (type === 'thumbnail') {
    // Thumbnail: limit height to 1080px (covers 40vh on big screens), consistent quality
    return url.replace("/upload/", `/upload/${baseParams},q_auto,c_limit,h_1080/`);
  } else if (type === 'placeholder') {
    // Tiny blurred placeholder
    return url.replace("/upload/", `/upload/${baseParams},q_auto:low,w_20,c_scale,e_blur:1000/`);
  } else if (type === 'full') {
    // Full screen: good quality, limit max width
    return url.replace("/upload/", `/upload/${baseParams},q_auto:good,c_limit,w_1920/`);
  }

  return url;
};

// Legacy support wrapper
const getSmartThumbnailUrl = (url) => getOptimizedUrl(url, 'thumbnail');

const Movements = () => {
  const [categories, setCategories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [imageDimensions, setImageDimensions] = useState({});

  // Subscribe to Firebase data
  useEffect(() => {
    const unsubCategories = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const cats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by order, then createdAt (Newest First)
        cats.sort((a, b) => {
          const orderA = a.order !== undefined ? a.order : 9999;
          const orderB = b.order !== undefined ? b.order : 9999;

          if (orderA !== orderB) return orderA - orderB;

          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        setCategories(cats);
        setLoading(false);
      }
    );

    const unsubPhotos = onSnapshot(
      collection(db, "photos"),
      (snapshot) => {
        const pics = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPhotos(pics);
      }
    );

    return () => {
      unsubCategories();
      unsubPhotos();
    };
  }, []);

  const getPhotosForCategory = (categoryName) => {
    return photos.filter(photo => photo.categoryId === categoryName);
  };

  const getCategoryInfo = (categoryName) => {
    // First, try to get from the category object itself (from Firestore)
    const category = categories.find(c => c.name === categoryName);
    if (category?.tagline && category?.description) {
      return {
        tagline: category.tagline,
        description: category.description
      };
    }

    // Fallback to hardcoded defaults (for backward compatibility)
    const trimmedName = categoryName?.trim();
    if (categoryDescriptions[trimmedName]) {
      return categoryDescriptions[trimmedName];
    }

    // Try case-insensitive match
    const matchingKey = Object.keys(categoryDescriptions).find(
      key => key.toLowerCase() === trimmedName?.toLowerCase()
    );

    if (matchingKey) {
      return categoryDescriptions[matchingKey];
    }

    // Final fallback to default
    return defaultDescription;
  };

  // Handle image loading errors
  const handleImageError = (photoId, e) => {
    console.error(`Failed to load image: ${photoId}`, e);
    setImageErrors(prev => ({ ...prev, [photoId]: true }));
  };

  // Check if image has error
  const hasImageError = (photoId) => {
    return imageErrors[photoId] === true;
  };

  // Handle image load to detect aspect ratio
  const handleImageLoad = (photoId, event) => {
    const img = event.target;
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    if (width && height) {
      const ratio = calculateAspectRatio(width, height);
      setImageDimensions(prev => ({
        ...prev,
        [photoId]: ratio
      }));
    }
  };

  // Navigation Handlers
  const handleNext = (e) => {
    if (e) e.stopPropagation();
    const currentPhotos = getPhotosForCategory(selectedCategory);
    if (!currentPhotos.length || !selectedImage) return;
    const currentIndex = currentPhotos.findIndex(p => p.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % currentPhotos.length;
    setSelectedImage(currentPhotos[nextIndex]);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    const currentPhotos = getPhotosForCategory(selectedCategory);
    if (!currentPhotos.length || !selectedImage) return;
    const currentIndex = currentPhotos.findIndex(p => p.id === selectedImage.id);
    const prevIndex = (currentIndex - 1 + currentPhotos.length) % currentPhotos.length;
    setSelectedImage(currentPhotos[prevIndex]);
  };

  // Keyboard Navigation
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, selectedCategory, photos]);

  if (loading) {
    return (
      <div className="movements-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="movements-container"
      onContextMenu={(e) => e.preventDefault()} // Disable right-click globally in this component
    >
      <Helmet>
        <title>Portfolio | Sanjivani Studios - Our Best Moments</title>
        <meta name="description" content="Explore our portfolio of Wedding, Maternity, Corporate, and Fashion photography. See our best captured moments." />
      </Helmet>
      <div className="movements-content">
        {/* Header */}
        <div className="movements-header">
          <span className="header-badge">Our Portfolio</span>
          <h1 className="movements-title">Our Best Moments</h1>
          <p className="movements-subtitle">
            {selectedCategory
              ? `Exploring ${selectedCategory}`
              : 'Discover our work across different categories'}
          </p>
        </div>

        {/* Zig-Zag Category Layout */}
        {!selectedCategory && (
          <div className="categories-zigzag">
            {categories.length > 0 ? (
              categories.map((category, index) => {
                const categoryPhotos = getPhotosForCategory(category.name);
                const coverPhoto = categoryPhotos[0];
                const categoryInfo = getCategoryInfo(category.name);
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={category.id}
                    className={`zigzag-row ${isEven ? 'row-normal' : 'row-reverse'}`}
                  >
                    {/* Image Side */}
                    <div
                      className="zigzag-image"
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {coverPhoto && !hasImageError(coverPhoto.id) ? (
                        <LazyLoadImage
                          src={getSmartThumbnailUrl(coverPhoto.url)}
                          alt={category.name}
                          effect="blur"
                          className="category-img"
                          onError={(e) => handleImageError(coverPhoto.id, e)}
                        />
                      ) : (
                        <div className="category-placeholder">
                          <span className="placeholder-icon">📷</span>
                          <span className="placeholder-text">
                            {coverPhoto && hasImageError(coverPhoto.id) ? 'Image unavailable' : 'No photos yet'}
                          </span>
                        </div>
                      )}
                      <div className="image-overlay">
                        <span className="view-text">View Gallery →</span>
                      </div>
                    </div>

                    {/* Text Side */}
                    <div className="zigzag-text">
                      <span className="category-number">0{index + 1}</span>
                      <h2 className="category-title">{category.name}</h2>
                      <p className="category-tagline">{categoryInfo.tagline}</p>
                      <p className="category-description">{categoryInfo.description}</p>
                      <div className="category-meta">
                        <span className="photo-count">{categoryPhotos.length} Photos</span>
                        <button
                          className="explore-btn"
                          onClick={() => setSelectedCategory(category.name)}
                        >
                          Explore Collection
                          <span className="btn-arrow">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-content">
                <div className="no-content-icon">📸</div>
                <h3>No Categories Yet</h3>
                <p>Photos will appear here once the admin uploads them.</p>
              </div>
            )}
          </div>
        )}

        {/* Photo Grid - When category selected */}
        {selectedCategory && (
          <div className="photo-gallery">
            <button
              className="back-button"
              onClick={() => setSelectedCategory(null)}
            >
              ← Back
            </button>

            <div className="gallery-header">
              <h2>{selectedCategory}</h2>
              <p>{getCategoryInfo(selectedCategory).tagline}</p>
            </div>

            <div className="photos-grid">
              {getPhotosForCategory(selectedCategory).map((photo, index) => (
                <div
                  key={photo.id}
                  className="photo-item"
                  data-ratio={imageDimensions[photo.id] || undefined}
                  onClick={() => !hasImageError(photo.id) && setSelectedImage(photo)}
                >
                  <div className="category-image-container">
                    {/* Blur-up placeholder */}
                    <div
                      className="blur-placeholder"
                      style={{
                        backgroundImage: `url(${getOptimizedUrl(photo.url, 'placeholder')})`
                      }}
                    />

                    <LazyLoadImage
                      src={getOptimizedUrl(photo.url, 'thumbnail')}
                      alt={photo.id}
                      effect="opacity"
                      threshold={300}
                      wrapperClassName="lazy-image-wrapper"
                      placeholderSrc={getOptimizedUrl(photo.url, 'placeholder')}
                      visibleByDefault={index < 3}
                      onError={(e) => handleImageError(photo.id, e)}
                      onLoad={(e) => handleImageLoad(photo.id, e)}
                    />

                    {hasImageError(photo.id) && (
                      <div className="photo-error-placeholder">
                        <span className="error-icon">⚠️</span>
                        <span className="error-text">Image Unavailable</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {getPhotosForCategory(selectedCategory).length === 0 && (
              <div className="no-content">
                <p>No photos in this category yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="lightbox"
            onClick={() => setSelectedImage(null)}
          >
            <button className="lightbox-close">×</button>
            <button className="lightbox-nav-btn lightbox-prev" onClick={handlePrev}>‹</button>

            {!hasImageError(selectedImage.id) ? (
              <img
                src={selectedImage.url}
                alt=""
                className="lightbox-image"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => handleImageError(selectedImage.id, e)}
              />
            ) : (
              <div className="lightbox-error" onClick={(e) => e.stopPropagation()}>
                <span className="error-icon" style={{ fontSize: '48px' }}>⚠️</span>
                <p style={{ color: 'white', marginTop: '20px' }}>Image failed to load</p>
              </div>
            )}

            <button className="lightbox-nav-btn lightbox-next" onClick={handleNext}>›</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movements;