import React, { useState, useEffect } from 'react';
import './ReviewMarquee.css';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { reviews as staticReviews } from '../../data/reviews'; // Fallback/Initial data

const ReviewMarquee = () => {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        // Query last 10 reviews
        const q = query(
            collection(db, 'reviews'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newReviews = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // If no reviews in DB yet, show static reviews
            setReviews(newReviews.length > 0 ? newReviews : staticReviews);
        });

        return () => unsubscribe();
    }, []);

    // We duplicate the reviews to ensure a seamless loop
    const marqueeContent = reviews.length > 0 ? [...reviews, ...reviews] : [];

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

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
