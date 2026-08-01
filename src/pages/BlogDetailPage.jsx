import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Leaf,
  Link2,
  MessageCircle,
  Share2,
  Sparkles,
  UserRound,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./BlogDetailPage.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5005"
).replace(/\/$/, "");

const FALLBACK_ARTICLES = [
  {
    _id: "farm-to-home",
    slug: "farm-to-home",
    title: "From Farm to Home: How Fresh Food Reaches Your Family",
    category: "Farm Stories",
    readTime: "6 min read",
    author: "The Kissan City",
    image: "/hero_banner.png",
    createdAt: "2026-06-18T00:00:00.000Z",
    metaDescription:
      "A clear look at how responsible sourcing, careful packing and shorter supply chains help protect food quality.",
    content:
      "<p>Freshness is not created at the warehouse. It begins with the farmer, the soil, the harvest timing and the care taken throughout the journey.</p><h2>Why a shorter supply chain matters</h2><p>Every unnecessary handling stage can affect freshness, traceability and value. By working more directly with producers, families receive clearer information and farmers receive better recognition for their work.</p><ul><li>Better product traceability</li><li>Fewer unnecessary storage stages</li><li>Clearer quality responsibility</li><li>More value retained by the farming community</li></ul><h2>Quality at every stage</h2><p>Careful sorting, clean packaging and responsible delivery help protect the work already completed at the farm.</p><blockquote>Good food reaches the family when every person in the chain treats freshness as a shared responsibility.</blockquote>",
  },
  {
    _id: "pure-ghee-guide",
    slug: "pure-ghee-guide",
    title: "How to Identify Pure Desi Ghee at Home",
    category: "Food Guide",
    readTime: "5 min read",
    author: "Kissan Kitchen",
    image: "/product_ghee.png",
    createdAt: "2026-06-12T00:00:00.000Z",
    metaDescription:
      "Learn practical signs that can help you understand the aroma, texture and storage behaviour of quality desi ghee.",
    content:
      "<p>Pure ghee has a naturally rich aroma, a clean aftertaste and texture that can change with temperature.</p><h2>What you can observe</h2><ul><li>Natural grainy texture in suitable weather</li><li>Clean, nutty aroma without artificial fragrance</li><li>Transparent ingredient and sourcing details</li><li>Appropriate packaging and storage information</li></ul>",
  },
  {
    _id: "healthy-pantry",
    slug: "healthy-pantry",
    title: "7 Simple Ways to Build a Cleaner Everyday Pantry",
    category: "Healthy Living",
    readTime: "4 min read",
    author: "Kissan Wellness",
    image: "/hero_promo_2.png",
    createdAt: "2026-05-14T00:00:00.000Z",
    metaDescription:
      "Small, practical changes that can make everyday pantry choices clearer and more intentional.",
    content:
      "<p>A cleaner pantry does not require changing everything at once.</p><ol><li>Read ingredient labels</li><li>Prefer shorter ingredient lists</li><li>Check sourcing information</li><li>Store products correctly</li></ol>",
  },
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

function formatDate(value) {
  if (!value) return "Latest article";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Latest article";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function normalizeBlog(blog, index = 0) {
  const title = blog?.title || "Untitled Article";
  return {
    ...blog,
    _id: blog?._id || blog?.id || `blog-${index}`,
    slug: blog?.slug || slugify(title) || `blog-${index}`,
    title,
    category: blog?.category || "Farm Journal",
    readTime: blog?.readTime || "5 min read",
    author: blog?.author || "The Kissan City",
    image: resolveBlogImage(blog?.image),
    excerpt:
      blog?.metaDescription ||
      stripHtml(blog?.content).slice(0, 190) ||
      "Useful farm, food and healthy living insights from The Kissan City.",
    content: blog?.content || "",
  };
}

function prepareArticleHtml(html) {
  if (!html || typeof DOMParser === "undefined") {
    return { html: html || "", headings: [] };
  }

  // Normalize: remove literal newlines that cause mid-word breaks in rendered HTML
  const cleanedHtml = html
    .replace(/\r\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ');

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<article id="blog-detail-clean-root">${cleanedHtml}</article>`,
      "text/html",
    );
    const root = doc.getElementById("blog-detail-clean-root");
    if (!root) return { html: cleanedHtml, headings: [] };

    root
      .querySelectorAll("script, style, iframe, object, embed, form")
      .forEach((node) => node.remove());

    root.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const value = attribute.value.trim().toLowerCase();
        if (
          name.startsWith("on") ||
          (name === "href" && value.startsWith("javascript:"))
        ) {
          node.removeAttribute(attribute.name);
        }
      });

      node.removeAttribute("style");
      node.removeAttribute("class");

      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noreferrer noopener");
      }
    });

    const headings = [];
    root.querySelectorAll("h2, h3").forEach((heading, index) => {
      const text = heading.textContent?.trim();
      if (!text) return;
      const id = `${slugify(text) || "section"}-${index + 1}`;
      heading.id = id;
      headings.push({ id, text, level: heading.tagName.toLowerCase() });
    });

    return { html: root.innerHTML, headings };
  } catch (error) {
    console.error("Could not prepare article HTML:", error);
    return { html: cleanedHtml, headings: [] };
  }
}

function articleMatches(blog, identifier) {
  if (!blog || !identifier) return false;
  const candidates = [blog.slug, blog._id, blog.id, slugify(blog.title)]
    .filter(Boolean)
    .map(String);
  return candidates.includes(String(identifier));
}


function FacebookIcon({ size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M13.5 22v-8h2.75l.41-3.18H13.5V8.79c0-.92.26-1.55 1.58-1.55h1.69V4.4c-.29-.04-1.3-.12-2.47-.12-2.44 0-4.11 1.49-4.11 4.23v2.31H7.43V14h2.76v8h3.31Z" />
    </svg>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const passedBlog = location.state?.blog;

  const [article, setArticle] = useState(
    passedBlog ? normalizeBlog(passedBlog) : null,
  );
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(!passedBlog);
  const [notFound, setNotFound] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [slug]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadArticle() {
      setLoading(!article);
      setNotFound(false);

      let list = [];
      let resolvedArticle = articleMatches(passedBlog, slug)
        ? normalizeBlog(passedBlog)
        : null;

      try {
        const detailResponse = await fetch(
          `${API_BASE_URL}/api/blogs/${encodeURIComponent(slug)}`,
          { signal: controller.signal },
        );

        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          const detailBlog = detailData?.blog || detailData?.data || detailData;
          if (detailBlog && !Array.isArray(detailBlog)) {
            resolvedArticle = normalizeBlog(detailBlog);
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.info("Direct blog detail endpoint was not available.");
        }
      }

      try {
        const listResponse = await fetch(`${API_BASE_URL}/api/blogs`, {
          signal: controller.signal,
        });
        if (listResponse.ok) {
          const listData = await listResponse.json();
          const incoming = Array.isArray(listData)
            ? listData
            : Array.isArray(listData?.blogs)
              ? listData.blogs
              : [];
          list = incoming.map(normalizeBlog);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Blog list API error:", error);
        }
      }

      if (!resolvedArticle) {
        resolvedArticle =
          list.find((blog) => articleMatches(blog, slug)) || null;
      }

      if (!controller.signal.aborted) {
        setAllBlogs(list);
        setArticle(resolvedArticle);
        setNotFound(!resolvedArticle);
        setLoading(false);
      }
    }

    loadArticle();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    document.title = `${article.title} | The Kissan City`;

    let meta = document.querySelector('meta[name="description"]');
    const createdMeta = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", article.excerpt);

    return () => {
      if (createdMeta) meta?.remove();
    };
  }, [article]);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        scrollable > 0 ? Math.min(100, (scrollTop / scrollable) * 100) : 0,
      );
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const preparedContent = useMemo(
    () => prepareArticleHtml(article?.content),
    [article?.content],
  );

  const relatedBlogs = useMemo(() => {
    if (!article) return [];
    return allBlogs
      .filter((blog) => !articleMatches(blog, article._id))
      .sort((a, b) => {
        const aSame = a.category === article.category ? 1 : 0;
        const bSame = b.category === article.category ? 1 : 0;
        return bSame - aSame;
      })
      .slice(0, 3);
  }, [allBlogs, article]);

  const articleUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareArticle = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: articleUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      if (error?.name !== "AbortError")
        console.error("Could not share article:", error);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Could not copy article link:", error);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="blog-detail-page blog-detail-loading">
          <div className="blog-detail-progress" style={{ width: "18%" }} />
          <div className="blog-detail-container">
            <div className="blog-detail-skeleton blog-detail-skeleton--hero" />
            <div className="blog-detail-skeleton-grid">
              <div className="blog-detail-skeleton blog-detail-skeleton--article" />
              <div className="blog-detail-skeleton blog-detail-skeleton--sidebar" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !article) {
    return (
      <>
        <Navbar />
        <main className="blog-detail-not-found">
          <div className="blog-detail-not-found__icon">
            <BookOpen size={42} />
          </div>
          <span>Article not found</span>
          <h1>This story is no longer available</h1>
          <p>The article may have been moved, renamed or removed.</p>
          <Link to="/blog">
            <ArrowLeft size={17} /> Back to all articles
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="blog-detail-progress" style={{ width: `${progress}%` }} />

      <main className="blog-detail-page">
        <section className="blog-detail-hero">
          <div className="blog-detail-hero__image">
            <img
              src={article.image}
              alt={article.title}
              onError={(event) => {
                event.currentTarget.src = "/hero_banner.png";
              }}
            />
          </div>
          <div className="blog-detail-hero__overlay" />

          <div className="blog-detail-container blog-detail-hero__content">
            <nav className="blog-detail-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/blog">Blog</Link>
              <span>/</span>
              <span>{article.category}</span>
            </nav>

            <div className="blog-detail-category">
              <Leaf size={14} /> {article.category}
            </div>
            <h1>{article.title}</h1>
            <p>{article.excerpt}</p>

            <div className="blog-detail-meta">
              <span>
                <UserRound size={16} /> {article.author}
              </span>
              <span>
                <CalendarDays size={16} /> {formatDate(article.createdAt)}
              </span>
              <span>
                <Clock3 size={16} /> {article.readTime}
              </span>
            </div>
          </div>
        </section>

        <section className="blog-detail-body">
          <div className="blog-detail-container blog-detail-layout">
            <article className="blog-detail-article-card">
              <div className="blog-detail-mobile-share">
                <span>Share this article</span>
                <button type="button" onClick={shareArticle}>
                  {copied ? <Check size={17} /> : <Share2 size={17} />}
                </button>
              </div>

              <div className="blog-detail-intro">
                <Sparkles size={22} />
                <p>{article.excerpt}</p>
              </div>

              <div
                className="blog-detail-content"
                dangerouslySetInnerHTML={{
                  __html:
                    preparedContent.html ||
                    `<p>${article.excerpt}</p><p>More details will be added soon.</p>`,
                }}
              />

              <div className="blog-detail-tags">
                <span>Topics</span>
                {[article.category, "Farm Fresh", "Healthy Living"].map(
                  (tag) => (
                    <Link
                      to={`/blog?category=${encodeURIComponent(tag)}`}
                      key={tag}
                    >
                      #{tag}
                    </Link>
                  ),
                )}
              </div>

              <div className="blog-detail-author-card">
                <div className="blog-detail-author-card__avatar">
                  <Leaf size={29} />
                </div>
                <div>
                  <span>Written by</span>
                  <h3>{article.author}</h3>
                  <p>
                    Sharing practical stories about responsible farming, honest
                    food and healthier everyday choices.
                  </p>
                </div>
              </div>
            </article>

            <aside className="blog-detail-sidebar">
              <div className="blog-detail-sidebar-card blog-detail-share-card">
                <span className="blog-detail-sidebar-label">
                  Share this story
                </span>
                <div className="blog-detail-share-buttons">
                  <button
                    type="button"
                    onClick={shareArticle}
                    aria-label="Share article"
                  >
                    <Share2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={copyLink}
                    aria-label="Copy article link"
                  >
                    {copied ? <Check size={18} /> : <Link2 size={18} />}
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${article.title} ${articleUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Share on WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Share on Facebook"
                  >
                    <FacebookIcon size={18} />
                  </a>
                </div>
                {copied && (
                  <div className="blog-detail-copied">
                    <Copy size={13} /> Link copied
                  </div>
                )}
              </div>

              {preparedContent.headings.length > 0 && (
                <div className="blog-detail-sidebar-card blog-detail-toc">
                  <span className="blog-detail-sidebar-label">
                    In this article
                  </span>
                  <nav>
                    {preparedContent.headings.map((heading, index) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={
                          heading.level === "h3" ? "is-subheading" : ""
                        }
                      >
                        <span>{String(index + 1).padStart(2, "0")}</span>
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              <div className="blog-detail-sidebar-card blog-detail-shop-card">
                <div className="blog-detail-shop-card__icon">
                  <Leaf size={27} />
                </div>
                <span>Pure food, directly sourced</span>
                <h3>Discover farm-fresh essentials for your family</h3>
                <Link to="/shop">
                  Explore products <ArrowRight size={16} />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {relatedBlogs.length > 0 && (
          <section className="blog-detail-related">
            <div className="blog-detail-container">
              <div className="blog-detail-section-heading">
                <div>
                  <span>Keep reading</span>
                  <h2>Related stories</h2>
                </div>
                <Link to="/blog">
                  View all articles <ArrowRight size={17} />
                </Link>
              </div>

              <div className="blog-detail-related-grid">
                {relatedBlogs.map((blog) => (
                  <Link
                    to={`/blog/${blog.slug || blog._id}`}
                    state={{ blog }}
                    className="blog-detail-related-card"
                    key={blog._id}
                  >
                    <div className="blog-detail-related-card__image">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = "/hero_banner.png";
                        }}
                      />
                      <span>{blog.category}</span>
                    </div>
                    <div className="blog-detail-related-card__body">
                      <div>
                        <Clock3 size={13} /> {blog.readTime}
                      </div>
                      <h3>{blog.title}</h3>
                      <p>{blog.excerpt}</p>
                      <strong>
                        Read article <ArrowRight size={15} />
                      </strong>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}