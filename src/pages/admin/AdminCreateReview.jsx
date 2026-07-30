import React, { useState, useEffect } from 'react';
import { Save, UploadCloud } from 'lucide-react';
import './AdminCreateReview.css';

export default function AdminCreateReview() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [form, setForm] = useState({
    productId: '',
    reviewerName: '',
    reviewerLocation: '',
    rating: 5,
    title: '',
    comment: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const getBaseUrl = () => {
    return (import.meta.env.VITE_API_URL || 'https://thekissancity.com').replace(/\/$/, '');
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/api/products`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productId || !form.reviewerName || !form.comment) {
      setMessage({ type: 'error', text: 'Product, Reviewer Name, and Comment are required.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('productId', form.productId);
      formData.append('reviewerName', form.reviewerName);
      formData.append('reviewerLocation', form.reviewerLocation);
      formData.append('rating', form.rating);
      formData.append('title', form.title);
      formData.append('comment', form.comment);
      if (image) {
        formData.append('image', image);
      }

      const res = await fetch(`${getBaseUrl()}/api/reviews/admin`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Review created successfully!' });
        setForm({
          productId: '',
          reviewerName: '',
          reviewerLocation: '',
          rating: 5,
          title: '',
          comment: ''
        });
        setImage(null);
        setImagePreview(null);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create review' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error while creating review' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading products...</div>;

  return (
    <div className="admin-create-review-page">
      <div className="admin-cr-header">
        <h2>Create Product Review</h2>
        <p>Manually add a review for a product. This will appear on the product page and homepage testimonials.</p>
      </div>

      {message.text && (
        <div className={`admin-cr-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-cr-form">
        <div className="admin-cr-grid">
          
          <div className="admin-cr-group full-width">
            <label>Select Product *</label>
            <select name="productId" value={form.productId} onChange={handleChange} required>
              <option value="">-- Select a Product --</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-cr-group">
            <label>Reviewer Name *</label>
            <input 
              type="text" 
              name="reviewerName" 
              value={form.reviewerName} 
              onChange={handleChange} 
              placeholder="e.g. Ramesh Kumar" 
              required 
            />
          </div>

          <div className="admin-cr-group">
            <label>Reviewer Location</label>
            <input 
              type="text" 
              name="reviewerLocation" 
              value={form.reviewerLocation} 
              onChange={handleChange} 
              placeholder="e.g. Haryana" 
            />
          </div>

          <div className="admin-cr-group">
            <label>Rating (1-5) *</label>
            <select name="rating" value={form.rating} onChange={handleChange} required>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="admin-cr-group">
            <label>Review Title</label>
            <input 
              type="text" 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              placeholder="e.g. Excellent Product!" 
            />
          </div>

          <div className="admin-cr-group full-width">
            <label>Review Comment *</label>
            <textarea 
              name="comment" 
              value={form.comment} 
              onChange={handleChange} 
              placeholder="Write the full review here..." 
              rows="4"
              required 
            />
          </div>

          <div className="admin-cr-group full-width">
            <label>Attach Image (Optional)</label>
            <div className="admin-cr-image-upload">
              <input 
                type="file" 
                id="review-image"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label htmlFor="review-image" className="admin-cr-upload-btn">
                <UploadCloud size={20} /> Choose Image
              </label>
              {imagePreview && (
                <div className="admin-cr-image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="admin-cr-actions">
          <button type="submit" disabled={saving} className="admin-cr-submit-btn">
            {saving ? 'Saving...' : <><Save size={18} /> Create Review</>}
          </button>
        </div>
      </form>
    </div>
  );
}
