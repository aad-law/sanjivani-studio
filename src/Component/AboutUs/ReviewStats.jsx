import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import ReviewForm from './ReviewForm';
import './ReviewStats.css';

const ReviewStats = () => {
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [stats, setStats] = useState({ average: 0, total: 0 });

    useEffect(() => {
        // Listen to all reviews to calculate average
        // Note: For very large collections, use a cloud function to aggregate this data instead
        const q = query(collection(db, 'reviews'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allReviews = snapshot.docs.map(doc => doc.data());
            setReviews(allReviews);

            if (allReviews.length > 0) {
                const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
                const average = (totalRating / allReviews.length).toFixed(1);
                setStats({ average, total: allReviews.length });
            } else {
                setStats({ average: 0, total: 0 });
            }
        });

        return () => unsubscribe();
    }, []);

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        return (
            <>
                {"★".repeat(fullStars)}
                {hasHalfStar ? "½" : ""}
                {"☆".repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
            </>
        );
    };

    return (
        <div className="review-stats-container">
            <div className="stats-content">
                <div className="average-rating">
                    <span className="rating-number">{stats.average}</span>
                    <div className="rating-stars">
                        {renderStars(Number(stats.average))}
                    </div>
                    <span className="total-reviews">({stats.total} Reviews)</span>
                </div>

                <button className="write-review-btn" onClick={() => setShowForm(true)}>
                    Write a Review
                </button>
            </div>

            {showForm && <ReviewForm onClose={() => setShowForm(false)} />}
        </div>
    );
};

export default ReviewStats;
