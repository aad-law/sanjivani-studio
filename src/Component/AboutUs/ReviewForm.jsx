import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './ReviewForm.css';

const ReviewForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        rating: 5,
        text: ''
    });
    const [status, setStatus] = useState({ type: 'idle', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'submitting', message: 'Submitting...' });

        try {
            await addDoc(collection(db, 'reviews'), {
                ...formData,
                createdAt: serverTimestamp()
            });
            setStatus({ type: 'success', message: 'Thank you! Your review has been added.' });
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Error adding document: ", error);
            setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="review-form-overlay" onClick={handleOverlayClick}>
            <div className="review-form-container fade-in-up">
                <button className="close-btn" onClick={onClose}>×</button>
                <h3>Write a Review</h3>

                {status.type === 'success' ? (
                    <div className="status-message success">
                        <div className="success-icon">✓</div>
                        <p>{status.message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your Name"
                                disabled={status.type === 'submitting'}
                            />
                        </div>

                        <div className="form-group">
                            <label>Rating</label>
                            <div className="star-rating-input">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`star ${star <= formData.rating ? 'active' : ''}`}
                                        onClick={() => status.type !== 'submitting' && setFormData({ ...formData, rating: star })}
                                        style={{ cursor: status.type === 'submitting' ? 'default' : 'pointer' }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <textarea
                                required
                                value={formData.text}
                                onChange={(e) => {
                                    if (e.target.value.length <= 300) {
                                        setFormData({ ...formData, text: e.target.value });
                                    }
                                }}
                                placeholder="Share your experience (max 300 characters)..."
                                rows="4"
                                maxLength={300}
                                disabled={status.type === 'submitting'}
                            />

                            <small style={{ color: '#aaa', display: 'block', marginTop: '5px' }}>
                                {formData.text.replace(/\s/g, '').length}/300 characters
                            </small>

                        </div>

                        {status.type === 'error' && (
                            <div className="error-message">{status.message}</div>
                        )}

                        <button
                            type="submit"
                            disabled={status.type === 'submitting'}
                            className={`submit-btn ${status.type === 'submitting' ? 'loading' : ''}`}
                        >
                            {status.type === 'submitting' ? 'Publishing...' : 'Submit Review'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ReviewForm;
