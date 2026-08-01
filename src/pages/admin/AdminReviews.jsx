import React, { useEffect, useState } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import './AdminReviews.css';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getBaseUrl = () => {
    return (import.meta.env.VITE_API_URL || 'http://localhost:5005').replace(/\/$/, '');
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${getBaseUrl()}/api/reviews/all`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReviews(data.reviews || []);
      } else {
        setError(data.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`${getBaseUrl()}/api/reviews/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      alert('Error deleting review');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading reviews...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div className="admin-reviews-page">
      <div className="admin-reviews-header">
        <h2>User Reviews</h2>
        <p>Manage all product reviews posted by users and created by admins.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="admin-reviews-empty">
          <p>No reviews found.</p>
        </div>
      ) : (
        <div className="admin-reviews-list">
          {reviews.map(review => (
            <div key={review._id} className="admin-review-card">
              <div className="admin-review-card-header">
                <div className="admin-review-rating">
                  {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                </div>
                <button 
                  className="admin-review-delete-btn"
                  onClick={() => handleDelete(review._id)}
                  title="Delete Review"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {review.product && (
                <div className="admin-review-product">
                  <Link to={`/product/${review.product.slug || review.product._id}`} target="_blank">
                    {review.product.name} <ExternalLink size={12} />
                  </Link>
                </div>
              )}

              <h4 className="admin-review-title">{review.title}</h4>
              <p className="admin-review-text">{review.comment}</p>

              {review.image && (
                <div className="admin-review-img-wrapper">
                  <img src={`${getBaseUrl()}${review.image}`} alt="Review attached" />
                </div>
              )}

              <div className="admin-review-footer">
                <span className="admin-review-author">
                  By: {review.reviewerName || review.user?.name || 'Anonymous'} 
                  {review.reviewerLocation && ` from ${review.reviewerLocation}`}
                </span>
                <span className="admin-review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
