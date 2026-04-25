import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight, Clock } from 'lucide-react';

const BlogSection = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blogs?limit=4');
        if (res.ok) {
          const { data } = await res.json();
          setBlogs(data);
        }
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading && blogs.length === 0) return null;
  if (!loading && blogs.length === 0) return null;

  return (
    <section className="bs-root py-16 sm:py-24 overflow-hidden" style={{ backgroundColor: '#F5F0E8' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .bs-root {
          --green: #2d6a4f;
          --brown: #6b4423;
          --brown-mid: #ba8c5c;
        }

        .bs-header {
          text-align: center;
          margin-bottom: 48px;
          padding: 0 16px;
        }

        .bs-eyebrow {
          display: inline-flex;
          align-items: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--brown-mid);
          margin-bottom: 12px;
          padding: 4px 14px;
          background: rgba(107, 68, 35, 0.08);
          border-radius: 20px;
          border: 1px solid rgba(107, 68, 35, 0.15);
        }

        .bs-title {
          font-family: 'Lora', serif;
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 700;
          color: #333;
          line-height: 1.2;
          letter-spacing: -0.5px;
          margin: 0 0 16px;
          position: relative;
        }

        .bs-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2.5px;
          background: linear-gradient(90deg, var(--green), var(--brown-mid));
          border-radius: 2px;
        }

        .bs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        @media (max-width: 1024px) { .bs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .bs-grid { grid-template-columns: 1fr; padding: 0 16px; } }

        .bs-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.04);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          display: flex;
          flex-direction: column;
        }

        .bs-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(45,106,79,0.12);
        }

        .bs-img-wrap {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: #f8f8f8;
        }

        .bs-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .bs-card:hover .bs-img-wrap img {
          transform: scale(1.06);
        }

        .bs-date-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(4px);
          padding: 4px 10px;
          border-radius: 30px;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: var(--green);
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .bs-content {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .bs-blog-title {
          font-family: 'Lora', serif;
          font-size: 18px;
          font-weight: 600;
          color: #2d2117;
          margin-bottom: 12px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.3s;
        }

        .bs-card:hover .bs-blog-title {
          color: var(--green);
        }

        .bs-excerpt {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #777;
          line-height: 1.6;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .bs-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid #f0f0f0;
        }

        .bs-read-more {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: var(--brown);
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s, gap 0.2s;
        }

        .bs-card:hover .bs-read-more {
          color: var(--green);
          gap: 10px;
        }
      `}</style>

      <div className="bs-header">
        <span className="bs-eyebrow">Our Journal</span>
        <h2 className="bs-title">Latest from the <span>Blog</span></h2>
      </div>

      <div className="bs-grid">
        {blogs.map((blog) => (
          <Link key={blog._id} to={`/blog/${blog.slug}`} className="bs-card">
            <div className="bs-img-wrap">
              <img 
                src={blog.image?.startsWith('http') ? blog.image : `/uploads/${blog.image}`} 
                alt={blog.title} 
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
              />
              <div className="bs-date-badge">
                <Clock size={10} />
                {new Date(blog.date || blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <div className="bs-content">
              <h3 className="bs-blog-title">{blog.title}</h3>
              <div 
                className="bs-excerpt" 
                dangerouslySetInnerHTML={{ __html: blog.content.substring(0, 120) + '...' }} 
              />
              <div className="bs-footer">
                <span className="bs-read-more">
                  Read Article <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BlogSection;
