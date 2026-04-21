import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Leaf, ArrowRight, Clock } from 'lucide-react';

const Blogs = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('/api/blogs');
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

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-4 overflow-hidden">
        {/* Soft decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#e8e2d5] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#dce1da] rounded-full blur-3xl opacity-40 translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-[#ba8c5c]/20 text-[#6b4423] text-xs font-semibold tracking-widest uppercase mb-6 shadow-sm">
            <Leaf className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <span>KisaanCity Journal</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-[#333] tracking-tight leading-tight mb-6 font-serif">
            Stories from the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2d6a4f] to-[#ба8c5c]">Heartland</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Discover articles on organic farming, authentic recipes, and the journey of pure ingredients from our hands to your home.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 max-w-7xl mx-auto w-full pb-24 relative z-10">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6a4f]"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center bg-white/40 backdrop-blur-sm rounded-3xl p-16 border border-white/50 shadow-sm max-w-2xl mx-auto">
            <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Articles Yet</h3>
            <p className="text-gray-500">We're planting the seeds for our new blog. Check back soon for fresh content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {blogs.map((blog, idx) => (
              <Link 
                to={`/blog/${blog.slug}`} 
                key={blog._id} 
                className="group flex flex-col bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-6px_rgba(45,106,79,0.15)] hover:-translate-y-1 transition-all duration-400 overflow-hidden border border-gray-100"
              >
                {/* Image Wrapper */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50">
                  {blog.image ? (
                    <img 
                      src={blog.image.startsWith('http') ? blog.image : `/uploads/${blog.image}`} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e8e2d5] to-[#f4f1eb]">
                      <Leaf className="w-10 h-10 text-[#c2b59b]" />
                    </div>
                  )}
                  {/* Badge */}
                  {idx === 0 && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[#2d6a4f] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
                      Latest
                    </div>
                  )}
                </div>

                {/* Content Box */}
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-medium font-sans mb-4 uppercase tracking-wide">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-[#ba8c5c]">{blog.author || 'KisaanCity'}</span>
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-xl md:text-2xl font-bold font-serif text-[#2d2117] leading-snug group-hover:text-[#2d6a4f] transition-colors mb-3 line-clamp-2">
                    {blog.title}
                  </h2>
                  
                  {/* Excerpt */}
                  <div className="text-gray-500 font-light leading-relaxed line-clamp-3 text-sm md:text-base mb-6 flex-1" 
                    dangerouslySetInnerHTML={{ __html: blog.content.substring(0, 180) + '...' }} 
                  />
                  
                  {/* Footer / CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-[#6b4423] font-semibold text-sm group-hover:text-[#2d6a4f] transition-colors flex items-center gap-1.5">
                      Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Blogs;
