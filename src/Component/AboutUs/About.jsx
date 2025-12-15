import React, { useState, useEffect } from "react";
import "./AboutUs.css";
import ReviewMarquee from "./ReviewMarquee";
import ReviewStats from "./ReviewStats";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";



export default function AboutUs() {

  const [activeCard, setActiveCard] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigate = useNavigate();

  function ContactPage() {
    navigate("/contact");
  }



  const services = [
      {
      id: 1,
      title: "Frame Designing",
      description: "Custom-designed frames to showcase your cherished memories with elegance and style.",
      icon: "🖼️",
      color: "#cd853f"
    },
    {
      id: 2,
      title: "Album Designing",
      description: "Premium, handcrafted photo albums that tell your story page by page.",
      icon: "📖",
      color: "#8b4513"
    },
    {
      id: 3,
      title: "Wedding Photography",
      description: "Capture your special day with timeless elegance. From intimate ceremonies to grand celebrations, we preserve every precious moment.",
      icon: "💍",
      color: "#ff6b9d"
    },
    {
      id: 4,
      title: "Corporate Events",
      description: "Professional documentation of conferences, seminars, and business gatherings. Elevate your brand with stunning corporate imagery.",
      icon: "🏢",
      color: "#4a90e2"
    },
    {
      id: 5,
      title: "Birthday Celebrations",
      description: "Make every birthday unforgettable with vibrant, joyful photography that captures the essence of your celebration.",
      icon: "🎂",
      color: "#ffd93d"
    },

    {
      id: 6,
      title: "Personal Photoshoots",
      description: "Express yourself through stunning portraits. Professional headshots, lifestyle shots, or creative concepts.",
      icon: "📸",
      color: "#c79fef"
    },
    {
      id: 7,
      title: "Pre-Wedding Shoots",
      description: "Tell your love story before the big day. Romantic, cinematic pre-wedding sessions at breathtaking locations.",
      icon: "💑",
      color: "#ff8fab"
    },
    {
      id: 8,
      title: "Fashion & Portfolio",
      description: "Build your modeling portfolio with high-fashion editorial shoots that showcase your unique style and personality.",
      icon: "👗",
      color: "#6c5ce7"
    },
    {
      id: 9,
      title: "Product Photography",
      description: "Showcase your products with stunning commercial photography that drives sales and elevates your brand.",
      icon: "📦",
      color: "#00b894"
    },
    {
      id: 10,
      title: "Family Portraits",
      description: "Create lasting memories with beautiful family portraits that capture the love and connection you share.",
      icon: "👨‍👩‍👧‍👦",
      color: "#fdcb6e"
    },
    {
      id: 11,
      title: "Engagement Sessions",
      description: "Celebrate your commitment with romantic engagement photography that marks the beginning of your journey together.",
      icon: "💐",
      color: "#e17055"
    },
    {
      id: 12,
      title: "Event Coverage",
      description: "From festivals to private parties, we capture the energy, emotion, and excitement of your special events.",
      icon: "🎉",
      color: "#fd79a8"
    },
        {
      id: 13,
      title: "Maternity Shoots",
      description: "Celebrate the beauty of motherhood with elegant and intimate maternity portraits that you'll treasure forever.",
      icon: "🤰",
      color: "#ff9a76"
    },
    {
      id: 14,
      title: "Baby Naming Ceremony",
      description: "Document the sacred moments of welcoming your little one with grace and cultural authenticity.",
      icon: "👶",
      color: "#a8e6cf"
    },
  
  ];

  return (
    <div className="about-container">
      <Helmet>
        <title>About Us | Sanjivani Studios - Professional Photographers</title>
        <meta name="description" content="Learn about Sanjivani Studios. We specialize in Wedding Photography, Corporate Events, Maternity Shoots, and more." />
      </Helmet>
      {/* heroo Section */}
      <section className="heroo-section">
        <div
          className="heroo-content"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <h1 className="heroo-title">
            Capturing Moments,<br />
            <span className="gradient-text">Creating Memories</span>
          </h1>
          <p className="heroo-subtitle">
            Professional photography services for every milestone in your life
          </p>


          <ReviewStats />
          <ReviewMarquee />

        </div>
        <div className="heroo-scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow">↓</div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-section">
        <div className="section-header">
          <h2 className="section-title">Our Services</h2>
          <p className="section-description">
            We specialize in capturing life's most beautiful moments across a wide range of events and occasions
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`service-card ${activeCard === service.id ? 'active' : ''}`}
              onMouseEnter={() => setActiveCard(service.id)}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div
                className="card-icon"
                style={{ background: service.color }}
              >
                {service.icon}
              </div>
              <h3 className="card-title">{service.title}</h3>
              <p className="card-description">{service.description}</p>
              <div className="card-hover-overlay" style={{ background: service.color }}></div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-section">
        <h2 className="section-title">Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">✨</div>
            <h3>Creative Excellence</h3>
            <p>Unique perspectives and artistic vision in every shot</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Quick Delivery</h3>
            <p>Fast turnaround without compromising quality</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">💎</div>
            <h3>Premium Quality</h3>
            <p>High-resolution images with professional editing</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤝</div>
            <h3>Client Focused</h3>
            <p>Your vision, our expertise, perfect results</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to Create Magic?</h2>
        <p className="cta-description">Let's discuss your photography needs and bring your vision to life</p>
        <button className="cta-button" onClick={ContactPage}>Contact Us</button>
      </section>
    </div>
  );
}