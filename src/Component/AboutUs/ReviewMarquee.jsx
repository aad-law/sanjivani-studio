import React, { useState, useEffect } from 'react';
import './ReviewMarquee.css';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { reviews as staticReviews } from '../../data/reviews'; // Fallback/Initial data

const ReviewMarquee = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Query last 10 reviews
        const q = query(
            collection(db, 'reviews'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                try {
                    const newReviews = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // If no reviews in DB yet, show static reviews
                    setReviews(newReviews.length > 0 ? newReviews : staticReviews);
                    setLoading(false);
                    setError(null);
                } catch (err) {
                    console.error("Error processing reviews:", err);
                    setReviews(staticReviews);
                    setLoading(false);
                    setError(err.message);
                }
            },
            (err) => {
                console.error("Error fetching reviews:", err);
                console.error("Error code:", err.code);
                console.error("Error message:", err.message);

                // Fallback to static reviews on error
                setReviews(staticReviews);
                setLoading(false);
                setError(err.message);
            }
        );

        return () => unsubscribe();
    }, []);

    // We duplicate the reviews to ensure a seamless loop
    const marqueeContent = reviews.length > 0 ? [...reviews, ...reviews] : [];

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    if (loading) {
        return (
            <div className="review-marquee-container">
                <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>
                    Loading reviews...
                </div>
            </div>
        );
    }

    if (error) {
        console.warn("ReviewMarquee error (showing fallback):", error);
    }

    return (
        <div className="review-marquee-container">
            <div className="marquee-track">
                {marqueeContent.map((review, index) => (
                    <div key={`${review.id}-${index}`} className="review-card">
                        <div className="review-header">
                            <span className="review-name">{review.name}</span>
                            <span className="review-rating">{renderStars(review.rating)}</span>
                        </div>
                        <p className="review-text">"{review.text}"</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewMarquee;
