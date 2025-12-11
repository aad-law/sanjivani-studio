// Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../assets/GoldenLogo.png";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        
        {/* Left - About Us */}
        <div className="nav-section nav-left">
          <Link
            to="/about"
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
          >
            About Us
          </Link>
        </div>

        {/* Center - Logo */}
        <div className="nav-section nav-center">
          <Link to="/" className="logo-link">
            <img src={Logo} alt="Company Logo" className="navbar-logo" />
          </Link>
        </div>

        {/* Right - Contact Us */}
        <div className="nav-section nav-right">
          <Link
            to="/contact"
            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
          >
            Contact Us
          </Link>
        </div>
        
      </div>
    </nav>
  );
}