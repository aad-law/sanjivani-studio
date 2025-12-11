import React, { useState, useEffect } from "react";
import "./Contact.css";
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import emailjs from '@emailjs/browser';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    event: '',
    date: '',
    number: '',
    location: '',
    message: ''
  });

  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize EmailJS - REMOVED useEffect, will use public key in send method

  const openLink = (url) => {
    window.open(url, "_blank");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    // Debug: Check if env variables are loaded
    console.log('Service ID:', import.meta.env.VITE_EMAILJS_SERVICE_ID);
    console.log('Template ID:', import.meta.env.VITE_EMAILJS_TEMPLATE_ID);
    console.log('Public Key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

    try {
      const result = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          event: formData.event,
          number: formData.number,
          date: formData.date,
          location: formData.location,
          message: formData.message // Added message field
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully:', result);
      setStatus('success');
      setFormData({ name: '', email: '', event: '', number: '', date: '', location: '', message: '' });

      // Clear success message after 5 seconds
      setTimeout(() => setStatus(''), 5000);
    } catch (error) {
      console.error('Email sending failed:', error);
      console.error('Error details:', error.text);
      setStatus('error');

      // Clear error message after 5 seconds
      setTimeout(() => setStatus(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">

        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-subtitle">We would love to hear from you!</p>

        <div className="contact-grid">

          {/* LEFT SIDE */}
          <div className="contact-left">
            <h2>Get In Touch</h2>

            <div className="contact-info">
              <div className="info-item">
                <FaInstagram
                  className="icon"
                  onClick={() => openLink("https://instagram.com/sanjivani_studios")}
                />
                <span onClick={() => openLink("https://instagram.com/sanjivani_studios")}
                >@sanjivani_studios</span>
              </div>

              <div className="info-item">
                <FaFacebook
                  className="icon"
                  onClick={() => openLink("https://facebook.com/sanjivanistudios")}
                />
                <span onClick={() => openLink("https://facebook.com/sanjivanistudios")}
                >Facebook Page</span>
              </div>

              <div className="info-item">
                <FaWhatsapp
                  className="icon"
                  onClick={() => openLink("https://wa.me/8806790392")}
                />
                <span onClick={() => openLink("https://wa.me/8806790392")}
                >+91 8806790392</span>
              </div>

              <div className="info-item">
                <MdEmail
                  className="icon"
                  onClick={() => openLink("mailto:sanjivanistudios93@gmail.com")}
                />
                <span onClick={() => openLink("mailto:sanjivanistudios93@gmail.com")}>sanjivanistudios93@gmail.com</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="contact-right">
            <h2>Send Message</h2>

            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your Name*"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Your Email*"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="tel"
                name="number"
                placeholder="Your Phone Number*"
                value={formData.number}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                maxLength={10}
              />

              <input
                type="text"
                name="date"
                placeholder="Date"
                value={formData.date}
                onChange={handleChange}
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.type = "text";
                  }
                }}
                required
              />

              <input
                type="text"
                name="location"
                placeholder="Event Location*"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <textarea
                name="message"
                placeholder="Message (Optional)"
                value={formData.message}
                onChange={handleChange}
                rows="4"
              ></textarea>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
              </button>

              {status === 'success' && (
                <p className="success-message">Message sent successfully!</p>
              )}
              {status === 'error' && (
                <p className="error-message">Failed to send message. Please try again.</p>
              )}
            </form>

          </div>

        </div>
      </div>
    </div>
  );
}