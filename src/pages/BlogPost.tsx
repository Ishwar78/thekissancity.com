import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Clock, User, Share2, ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const BlogPost = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/blogs/${slug}`);
        if (res.ok) {
          const { data } = await res.json();
          setBlog(data);
        }
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d6a4f]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex flex-col font-sans text-center">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-[#6b4423] mb-4 font-serif">Article Not Found</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">We couldn't find the story you're looking for. It might have been moved or removed.</p>
          <Link to="/blog" className="bg-[#2d6a4f] text-white px-8 py-3 rounded-full hover:bg-[#1b4332] font-semibold transition-colors shadow-sm">
            Explore Journal
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col font-sans selection:bg-[#2d6a4f]/20">
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{blog.seoTitle || `${blog.title} | KissanCity Journal`}</title>
        <meta name="description" content={blog.seoDescription || `Read about ${blog.title} and more on the KissanCity organic farming journal.`} />
        {blog.seoKeywords && <meta name="keywords" content={blog.seoKeywords} />}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={blog.seoTitle || blog.title} />
        <meta property="og:description" content={blog.seoDescription || `Read about ${blog.title} on KissanCity.`} />
        {blog.image && (
          <meta property="og:image" content={blog.image.startsWith('http') ? blog.image : `${window.location.origin}/uploads/${blog.image}`} />
        )}

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={blog.seoTitle || blog.title} />
        <meta property="twitter:description" content={blog.seoDescription || `Read about ${blog.title} on KissanCity.`} />
        {blog.image && (
          <meta property="twitter:image" content={blog.image.startsWith('http') ? blog.image : `${window.location.origin}/uploads/${blog.image}`} />
        )}
      </Helmet>
      
      <Navbar />
      
      {/* Hero Section Container */}
      <div className="relative w-full pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Back button */}
          <div className="mb-10 inline-block">
            <Link to="/blog" className="inline-flex items-center text-[#ba8c5c] hover:text-[#2d6a4f] text-sm font-semibold tracking-wide uppercase transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Journal
            </Link>
          </div>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[#6b4423]/80 font-medium font-sans mb-8">
            <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur px-4 py-1.5 rounded-full border border-gray-200/50 shadow-sm">
              <Clock className="w-4 h-4" />
              <span>{new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            {blog.author && (
              <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur px-4 py-1.5 rounded-full border border-gray-200/50 shadow-sm">
                <User className="w-4 h-4" />
                <span>{blog.author}</span>
              </div>
            )}
          </div>
          
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-[#2d2117] leading-tight mb-8 font-serif px-2">
            {blog.title}
          </h1>
        </div>

        {/* Featured Image */}
        {blog.image && (
          <div className="max-w-5xl mx-auto relative z-10 mt-6 lg:mt-12">
            <div className="aspect-[21/9] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-white/60">
              <img 
                src={blog.image.startsWith('http') ? blog.image : `/uploads/${blog.image}`} 
                alt={blog.title} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 w-full relative z-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 pb-24 lg:pb-32 -mt-4 lg:-mt-10">
          <div className="bg-white rounded-[2.5rem] shadow-sm p-8 md:p-12 lg:p-16 ring-1 ring-gray-100">
            {/* Share / Tags simple bar */}
            {/* <div className="flex justify-end mb-10 pb-6 border-b border-gray-100">
              <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="flex items-center gap-2 text-gray-500 hover:text-[#2d6a4f] transition-colors text-sm font-medium">
                <Share2 className="w-4 h-4" /> Copy Link
              </button>
            </div> */}

            {/* Rich Content with Read More */}
            <div className="relative">
              {/* Content wrapper with smooth height transition */}
              <div
                className="overflow-hidden transition-all duration-700 ease-in-out"
                style={{ maxHeight: expanded ? '99999px' : '320px' }}
              >
                <div 
                  className="prose prose-lg md:prose-xl prose-stone max-w-none 
                    prose-headings:font-serif prose-headings:text-[#2d2117] prose-headings:font-bold prose-h2:mt-10 prose-h2:mb-6
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-a:text-[#ba8c5c] hover:prose-a:text-[#2d6a4f] prose-a:transition-colors
                    prose-img:rounded-2xl prose-img:shadow-sm prose-img:my-10
                    prose-blockquote:border-l-[#2d6a4f] prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-gray-700
                    prose-li:text-gray-600
                    [&>*:first-child]:mt-0"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>

              {/* Gradient fade overlay + Read More button — hidden when expanded */}
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                  {/* Gradient fade */}
                  <div className="w-full h-32 bg-gradient-to-t from-white via-white/80 to-transparent" />
                  {/* Button */}
                  <button
                    onClick={() => setExpanded(true)}
                    className="-mt-2 mb-2 inline-flex items-center gap-2 px-7 py-3 bg-[#2d6a4f] text-white text-sm font-semibold rounded-full shadow-lg hover:bg-[#1b4332] hover:shadow-xl active:scale-95 transition-all duration-200"
                  >
                    Read More
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* End of article marker */}
            {/* <div className="flex justify-center mt-16 pt-16 border-t border-gray-100">
              <div className="h-1.5 w-1.5 rounded-full bg-[#ba8c5c] mx-1" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#ba8c5c] mx-1 opacity-60" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#ba8c5c] mx-1 opacity-30" />
            </div> */}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPost;
