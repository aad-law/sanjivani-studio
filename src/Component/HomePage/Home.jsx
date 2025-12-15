// Home.jsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Video1 from "../../assets/Logovideo.mp4";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const goToMovements = () => {
    navigate("/movements");
  };

  useEffect(() => {
    // Lock scroll when component mounts
    document.body.style.overflow = 'hidden';

    const v = videoRef.current;
    if (v) {
      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { });
      }
    }

    setTimeout(() => setIsVisible(true), 100);

    // cleanup: Unlock scroll when component unmounts
    return () => {
      document.body.style.overflow = 'auto'; // or 'unset'
    };
  }, []);

  return (
    <div className="home-container">
      <Helmet>
        <title>Sanjivani Studios | Best Wedding Photography in Town</title>
        <meta name="description" content="Welcome to Sanjivani Studios. We capture your life's best moments - Weddings, Events, Pre-wedding and more." />
      </Helmet>
      <video
        ref={videoRef}
        className="home-video"
        src={Video1}
        playsInline
        autoPlay
        muted
        loop
        preload="auto"
      />

      <div className="video-overlay"></div>

      <div className={`content-wrapper ${isVisible ? 'visible' : ''}`}>
        {/* Hero Content */}
        <div className="hero-content">
          <p className="hero-subtitle">
            Want to capture your happy moments...?
          </p>

          <div className="cta-buttons">
            <button className="btn-primary" onClick={goToMovements}>
              Our best Moments
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}