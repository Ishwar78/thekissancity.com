import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Leaf,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./BlogPage.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5005"
).replace(/\/$/, "");

const FALLBACK_BLOGS = [
  {
    _id: "farm-to-home",
    title: "From Farm to Home: How Fresh Food Reaches Your Family",
    category: "Farm Stories",
    readTime: "6 min read",
    author: "The Kissan City",
    image: "/hero_banner.png",
    createdAt: "2026-06-18T00:00:00.000Z",
    metaDescription:
      "A clear look at how responsible sourcing, careful packing and shorter supply chains help protect food quality.",
    content:
      "<p>Freshness is not created at the warehouse. It begins with the farmer, the soil, the harvest timing and the care taken throughout the journey.</p><h2>Why a shorter supply chain matters</h2><p>Every unnecessary handling stage can affect freshness, traceability and value. By working more directly with producers, families receive clearer information and farmers receive better recognition for their work.</p><ul><li>Better product traceability</li><li>Fewer unnecessary storage stages</li><li>Clearer quality responsibility</li><li>More value retained by the farming community</li></ul>",
  },
  {
    _id: "pure-ghee-guide",
    title: "How to Identify Pure Desi Ghee at Home",
    category: "Food Guide",
    readTime: "5 min read",
    author: "Kissan Kitchen",
    image: "/product_ghee.png",
    createdAt: "2026-06-12T00:00:00.000Z",
    metaDescription:
      "Learn practical signs that can help you understand the aroma, texture and storage behaviour of quality desi ghee.",
    content:
      "<p>Pure ghee has a naturally rich aroma, a clean aftertaste and texture that can change with temperature. No single home test is perfect, so sourcing transparency remains the most reliable indicator.</p><h2>What you can observe</h2><ul><li>Natural grainy texture in suitable weather</li><li>Clean, nutty aroma without artificial fragrance</li><li>Transparent ingredient and sourcing details</li><li>Appropriate packaging and storage information</li></ul>",
  },
  {
    _id: "traditional-farming",
    title: "Why Traditional Farming Knowledge Still Matters",
    category: "Farmer Knowledge",
    readTime: "7 min read",
    author: "The Kissan City",
    image: "/healthimage.png",
    createdAt: "2026-05-29T00:00:00.000Z",
    metaDescription:
      "Traditional knowledge and modern quality systems can work together to create more responsible food choices.",
    content:
      "<p>Generations of farmers have learned how seasons, soil, water and crop diversity interact. Modern systems can improve consistency, but traditional observation still brings valuable context.</p><blockquote>Progress is strongest when technology supports farmer knowledge instead of replacing it.</blockquote><p>Responsible food systems combine traceability, testing and packaging with respect for local growing wisdom.</p>",
  },
  {
    _id: "healthy-pantry",
    title: "7 Simple Ways to Build a Cleaner Everyday Pantry",
    category: "Healthy Living",
    readTime: "4 min read",
    author: "Kissan Wellness",
    image: "/hero_promo_2.png",
    createdAt: "2026-05-14T00:00:00.000Z",
    metaDescription:
      "Small, practical changes that can make everyday pantry choices clearer and more intentional.",
    content:
      "<p>A cleaner pantry does not require changing everything at once. Start with products your family uses most frequently.</p><ol><li>Read ingredient labels</li><li>Prefer shorter ingredient lists</li><li>Check sourcing information</li><li>Store products correctly</li><li>Buy practical quantities</li><li>Rotate older packs first</li><li>Choose brands that answer questions clearly</li></ol>",
  },
];

function resolveBlogImage(value) {
  if (!value) return "/hero_banner.png";
  const normalized = String(value).trim().replace(/\\/g, "/");

  if (
    /^https?:\/\//i.test(normalized) ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return normalized;
  }

  if (normalized.startsWith("/uploads/")) return `${API_BASE_URL}${normalized}`;
  if (normalized.startsWith("uploads/")) return `${API_BASE_URL}/${normalized}`;
  if (normalized.startsWith("/")) return normalized;

  return `${API_BASE_URL}/uploads/${normalized}`;
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanArticleHtml(html) {
  if (!html || typeof DOMParser === "undefined") return html || "";

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<article id="blog-clean-root">${html}</article>`,
      "text/html",
    );
    const root = doc.getElementById("blog-clean-root");
    if (!root) return html;

    root
      .querySelectorAll("script, style, iframe, object")
      .forEach((node) => node.remove());
    root.querySelectorAll("*").forEach((node) => {
      node.removeAttribute("style");
      node.removeAttribute("class");
      node.removeAttribute("id");
      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noreferrer noopener");
      }
    });

    return root.innerHTML;
  } catch (error) {
    console.error("Could not clean blog content:", error);
    return html;
  }
}

function formatDate(dateValue) {
  if (!dateValue) return "Latest article";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Latest article";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeBlog(blog, index) {
  return {
    ...blog,
    _id: blog._id || blog.id || `blog-${index}`,
    slug:
      blog.slug ||
      String(blog.title || "untitled-article")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    title: blog.title || "Untitled Article",
    category: blog.category || "Farm Journal",
    readTime: blog.readTime || "5 min read",
    author: blog.author || "The Kissan City",
    image: resolveBlogImage(blog.image),
    excerpt:
      blog.metaDescription ||
      stripHtml(blog.content).slice(0, 175) ||
      "Explore useful farm, food and healthy living insights from The Kissan City.",
    content: cleanArticleHtml(blog.content),
  };
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Blog | The Kissan City";
    const controller = new AbortController();

    async function loadBlogs() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/blogs`, {
          signal: controller.signal,
        });
        const data = await response.json();
        const incoming = Array.isArray(data)
          ? data
          : Array.isArray(data?.blogs)
            ? data.blogs
            : [];

        setBlogs(incoming.map(normalizeBlog));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Blog page API error:", error);
          setBlogs([]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadBlogs();
    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const unique = [
      ...new Set(blogs.map((blog) => blog.category).filter(Boolean)),
    ];
    return ["All", ...unique];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return blogs.filter((blog) => {
      const categoryMatches =
        activeCategory === "All" || blog.category === activeCategory;
      const queryMatches =
        !query ||
        [
          blog.title,
          blog.category,
          blog.author,
          blog.excerpt,
          stripHtml(blog.content),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return categoryMatches && queryMatches;
    });
  }, [blogs, activeCategory, searchTerm]);

  const featuredBlog = filteredBlogs[0] || blogs[0];
  const regularBlogs = filteredBlogs.filter(
    (blog) => blog._id !== featuredBlog?._id,
  );

  const openBlog = (blog) => {
    navigate(`/blog/${blog.slug || blog._id}`, { state: { blog } });
  };

  return (
    <>
      <Navbar />

      <main className="blog-page">
        <section className="blog-hero">
          <div className="blog-page-container blog-hero__inner">
            <div className="blog-hero__copy">
              <div className="blog-eyebrow">
                <Sparkles size={15} /> The Kissan Journal
              </div>
              <h1>
                Simple, useful stories about food, farms and healthy living
              </h1>
              <p>
                Read practical guides, farmer stories and honest insights that
                help your family make better everyday choices.
              </p>
            </div>

            <div className="blog-hero__visual" aria-hidden="true">
              <span className="blog-hero__leaf blog-hero__leaf--one">
                <Leaf size={28} />
              </span>
              <span className="blog-hero__leaf blog-hero__leaf--two">
                <Leaf size={20} />
              </span>
              <div className="blog-hero__book">
                <BookOpen size={46} />
              </div>
              <strong>
                Fresh ideas,
                <br />
                naturally shared.
              </strong>
            </div>
          </div>
        </section>

        <section className="blog-discovery-section">
          <div className="blog-page-container">
            <div className="blog-discovery-bar">
              <label className="blog-search-box">
                <Search size={18} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search articles, topics or authors..."
                  aria-label="Search blog articles"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </label>

              <div className="blog-results-count">
                <strong>{filteredBlogs.length}</strong>
                <span>article{filteredBlogs.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <div
              className="blog-category-list"
              role="tablist"
              aria-label="Blog categories"
            >
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={activeCategory === category ? "is-active" : ""}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="blog-content-section">
          <div className="blog-page-container">
            {loading ? (
              <div className="blog-loading-grid">
                {[1, 2, 3].map((item) => (
                  <div className="blog-loading-card" key={item} />
                ))}
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="blog-empty-state">
                <span>
                  <Search size={30} />
                </span>
                <h2>No matching articles found</h2>
                <p>Try another word or select a different category.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("All");
                  }}
                >
                  Show all articles
                </button>
              </div>
            ) : (
              <>
                {featuredBlog && (
                  <article className="blog-featured-card">
                    <button
                      type="button"
                      className="blog-featured-card__image"
                      onClick={() => openBlog(featuredBlog)}
                      aria-label={`Read ${featuredBlog.title}`}
                    >
                      <img
                        src={featuredBlog.image}
                        alt={featuredBlog.title}
                        onError={(event) => {
                          event.currentTarget.src = "/hero_banner.png";
                        }}
                      />
                      <span>Featured Story</span>
                    </button>

                    <div className="blog-featured-card__content">
                      <div className="blog-card__category">
                        {featuredBlog.category}
                      </div>
                      <h2>{featuredBlog.title}</h2>
                      <p>{featuredBlog.excerpt}</p>
                      <div className="blog-card__meta">
                        <span>
                          <UserRound size={14} /> {featuredBlog.author}
                        </span>
                        <span>
                          <Clock3 size={14} /> {featuredBlog.readTime}
                        </span>
                        <span>
                          <CalendarDays size={14} />{" "}
                          {formatDate(featuredBlog.createdAt)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="blog-read-button"
                        onClick={() => openBlog(featuredBlog)}
                      >
                        Read full article <ArrowRight size={17} />
                      </button>
                    </div>
                  </article>
                )}

                {regularBlogs.length > 0 && (
                  <div className="blog-grid-heading">
                    <div>
                      <span>More from the journal</span>
                      <h2>Latest articles</h2>
                    </div>
                  </div>
                )}

                <div className="blog-card-grid">
                  {regularBlogs.map((blog) => (
                    <article className="blog-card" key={blog._id}>
                      <button
                        type="button"
                        className="blog-card__image"
                        onClick={() => openBlog(blog)}
                        aria-label={`Read ${blog.title}`}
                      >
                        <img
                          src={blog.image}
                          alt={blog.title}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.src = "/hero_banner.png";
                          }}
                        />
                        <span className="blog-card__category blog-card__category--floating">
                          {blog.category}
                        </span>
                      </button>

                      <div className="blog-card__body">
                        <div className="blog-card__meta blog-card__meta--compact">
                          <span>
                            <Clock3 size={13} /> {blog.readTime}
                          </span>
                          <span>
                            <CalendarDays size={13} />{" "}
                            {formatDate(blog.createdAt)}
                          </span>
                        </div>
                        <h3>{blog.title}</h3>
                        <p>{blog.excerpt}</p>
                        <div className="blog-card__footer">
                          <span>
                            <UserRound size={14} /> {blog.author}
                          </span>
                          <button
                            type="button"
                            onClick={() => openBlog(blog)}
                            aria-label={`Open ${blog.title}`}
                          >
                            <ArrowRight size={17} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}