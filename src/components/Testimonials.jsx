import React, { useEffect, useState } from "react";
// import "./Testimonials.css";

const fallbackReviews = [
  {
    _id: 1,
    comment: '"The A2 ghee from Kissan City is unreal! You can actually smell the difference — pure, aromatic, golden. My family has switched completely. No going back to store brands."',
    reviewerName: "Priya Sharma",
    reviewerLocation: "Delhi",
    rating: 5,
  },
  {
    _id: 2,
    comment: '"Ordered their cold-pressed mustard oil and moringa powder. Both are incredibly pure and fresh. The packaging is eco-friendly and the delivery was super fast. 10/10!"',
    reviewerName: "Rahul Verma",
    reviewerLocation: "Mumbai",
    rating: 5,
  },
  {
    _id: 3,
    comment: '"Finally found a brand that truly cares about quality! The saffron is genuinely Kashmiri, you can see the threads. Trust The Kissan City for authentic Indian farm products."',
    reviewerName: "Anita Nair",
    reviewerLocation: "Bangalore",
    rating: 5,
  },
  {
    _id: 4,
    comment: '"My diabetic father switched to their wild honey and his sugar levels are much better managed. The purity is unmatched. Thank you Kissan City!"',
    reviewerName: "Suresh Patel",
    reviewerLocation: "Ahmedabad",
    rating: 5,
  },
  {
    _id: 5,
    comment: '"Love the ashwagandha powder! Mixed with warm milk every night and feeling more energetic. It is genuinely pure, you can taste the difference from the regular ones."',
    reviewerName: "Meena Joshi",
    reviewerLocation: "Pune",
    rating: 5,
  },
  {
    _id: 6,
    comment: '"Incredible customer service. Asked about their farming practices and they connected me with the actual farmer! That level of transparency earns lifetime loyalty."',
    reviewerName: "Arjun Singh",
    reviewerLocation: "Jaipur",
    rating: 5,
  },
];

const getEmoji = (name) => {
  const emojis = ["👩", "👨", "🧑", "👧", "👦"];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return emojis[Math.abs(hash) % emojis.length];
};

export default function Testimonials() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/reviews/home`);
        const data = await res.json();
        if (data.success && data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        } else {
          setReviews(fallbackReviews);
        }
      } catch (error) {
        setReviews(fallbackReviews);
      }
    };
    fetchReviews();
  }, []);

  // For seamless scrolling, duplicate array
  const scrollingReviews = [...reviews, ...reviews];

  return (
    <section className="testimonials">
      <div className="testimonials__container">
        <div className="testimonials__header">
          <div className="section-badge">💬 Customer Love</div>

          <h2 className="section-title">
            What Our <span> The Kissan Family</span> Says
          </h2>

          <p className="section-subtitle">
            2 lakh+ happy families trust The Kissan City for pure,
            authentic farm products.
          </p>
        </div>

        <div className="testimonials__slider">
          <div className="testimonials__track">
            {scrollingReviews.map((r, index) => {
              const name = r.reviewerName || r.user?.name || 'Anonymous';
              const location = r.reviewerLocation ? `📍 ${r.reviewerLocation}` : (r.product?.name ? `📦 ${r.product.name}` : '📍 India');
              const stars = r.rating || 5;

              return (
                <div
                  key={`${r._id}-${index}`}
                  className="testimonial-card"
                >
                  <div className="testimonial-card__stars">
                    {"★".repeat(stars)}
                    {"☆".repeat(5 - stars)}
                  </div>

                  <p className="testimonial-card__text">"{r.comment || r.text}"</p>

                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">
                      {getEmoji(name)}
                    </div>

                    <div className="testimonial-card__info">
                      <h4>{name}</h4>
                      <p>{location}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}