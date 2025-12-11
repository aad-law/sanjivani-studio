import React, { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import './Movements.css';

// Category descriptions
const categoryDescriptions = {
  "Wedding": {
    tagline: "Where Love Meets Lens",
    description: "Every wedding tells a unique story of love, tradition, and celebration. We capture the stolen glances, the joyful tears, and the moments that become cherished memories for generations."
  },
  "Birthday": {
    tagline: "Celebrating Life's Milestones",
    description: "From the first candle to the hundredth, birthdays are magical moments of joy. We freeze these celebrations in time, capturing the laughter, surprises, and pure happiness."
  },
  "Corporate": {
    tagline: "Professional Excellence Captured",
    description: "Elevate your brand with stunning corporate imagery. From conferences to team portraits, we deliver polished visuals that speak volumes about your professional identity."
  },
  "Maternity": {
    tagline: "The Beauty of Becoming",
    description: "Pregnancy is a journey of transformation and wonder. Our maternity shoots celebrate the glow of motherhood with elegant, intimate portraits you'll treasure forever."
  },
  "Pre-Wedding": {
    tagline: "Your Love Story Begins",
    description: "Before the vows, there's a beautiful story waiting to be told. Our pre-wedding shoots capture the romance, chemistry, and anticipation of your journey together."
  },
  "Portrait": {
    tagline: "Your Story, Beautifully Told",
    description: "Every face has a story. Our portrait sessions reveal character, emotion, and personality through carefully crafted images that reflect who you truly are."
  },
  "Event": {
    tagline: "Moments Worth Remembering",
    description: "From intimate gatherings to grand celebrations, we document events with an eye for candid moments and the energy that makes each occasion special."
  },
  "Baby": {
    tagline: "Tiny Moments, Big Memories",
    description: "Those precious early days pass so quickly. We capture the tender moments, tiny details, and pure innocence of your little one's first chapter."
  }
};

const defaultDescription = {
  tagline: "Captured with Passion",
  description: "Every moment has its own magic. We bring our artistic vision and technical expertise to create stunning photographs that tell your unique story."
};

const Movements = () => {
  const [categories, setCategories] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase data
  useEffect(() => {
    const unsubCategories = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const cats = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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
    return categoryDescriptions[categoryName] || defaultDescription;
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

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
                      {coverPhoto ? (
                        <LazyLoadImage
                          src={coverPhoto.url}
                          alt={category.name}
                          effect="blur"
                          className="category-img"
                        />
                      ) : (
                        <div className="category-placeholder">
                          <span className="placeholder-icon">📷</span>
                          <span className="placeholder-text">No photos yet</span>
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
              {getPhotosForCategory(selectedCategory).map((photo) => (
                <div
                  key={photo.id}
                  className="photo-item"
                  onClick={() => setSelectedImage(photo)}
                >
                  <LazyLoadImage
                    src={photo.url}
                    alt=""
                    effect="blur"
                    className="photo-image"
                  />
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
            <img
              src={selectedImage.url}
              alt=""
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Movements;