import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import LazyImage from '../components/common/LazyImage';
import Newsletter from '../components/common/Newsletter';
import {
  fetchBlogs,
  selectAllBlogs,
  selectBlogsStatus,
  selectBlogsError,
  selectBlogsPagination,
} from '../redux/slices/Blogslice';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const getCover = (post) =>
  post.coverImage || post.image || post.imageUrl || post.thumbnail || null;

const getAuthor = (post) => {
  if (post.author && typeof post.author === 'object') return post.author;
  if (post.authorName || typeof post.author === 'string') {
    return { name: post.authorName || post.author, avatar: null };
  }
  return { name: 'Editorial', avatar: null };
};

const getPostHref = (post) =>
  post.url || post.link || (post.slug ? `/blog/${post.slug}` : '#');

/* ─── Author chip ─────────────────────────────────────────────────────────── */
const AuthorAvatar = ({ author, size = 24 }) => {
  const style = { width: size, height: size };
  if (author?.avatar) {
    return (
      <img
        src={author.avatar}
        alt={author.name}
        style={style}
        className="medium-avatar"
        loading="lazy"
      />
    );
  }
  return (
    <span className="medium-avatar medium-avatar-fallback" style={style}>
      {getInitials(author?.name || 'A')}
    </span>
  );
};

const PostMeta = ({ post }) => {
  const author = getAuthor(post);
  const read = post.readTime || post.read_time;
  return (
    <div className="medium-meta">
      <AuthorAvatar author={author} />
      <span className="medium-meta-author">{author.name}</span>
      <span className="medium-meta-dot">·</span>
      <span>{formatDate(post.publishedAt || post.date || post.createdAt)}</span>
      {read ? (
        <>
          <span className="medium-meta-dot">·</span>
          <span>{read} min read</span>
        </>
      ) : null}
    </div>
  );
};

/* ─── Featured (hero) post ────────────────────────────────────────────────── */
const FeaturedPost = ({ post }) => {
  const cover = getCover(post);
  const href = getPostHref(post);
  return (
    <article className="medium-featured">
      <Link to={href} className="medium-featured-image-wrap">
        {cover ? (
          <LazyImage src={cover} alt={post.title} className="medium-featured-image" />
        ) : (
          <div className="medium-featured-image medium-image-placeholder" />
        )}
      </Link>
      <div className="medium-featured-body">
        {post.category && (
          <span className="medium-eyebrow">Featured · {post.category}</span>
        )}
        <Link to={href} className="medium-title-link">
          <h2 className="medium-featured-title">{post.title}</h2>
        </Link>
        <p className="medium-featured-excerpt">
          {post.excerpt || post.summary || post.description}
        </p>
        <div className="mt-3">
          <PostMeta post={post} />
        </div>
      </div>
    </article>
  );
};

/* ─── List row (Medium-style) ─────────────────────────────────────────────── */
const PostRow = ({ post }) => {
  const cover = getCover(post);
  const href = getPostHref(post);
  const read = post.readTime || post.read_time;
  return (
    <article className="medium-row">
      <div className="medium-row-body">
        <PostMeta post={post} />
        <Link to={href} className="medium-title-link">
          <h3 className="medium-row-title">{post.title}</h3>
          <p className="medium-row-excerpt">
            {post.excerpt || post.summary || post.description}
          </p>
        </Link>
        <div className="medium-row-foot">
          {post.category && <span className="medium-chip">{post.category}</span>}
          {read ? <span className="medium-row-foot-text">{read} min read</span> : null}
        </div>
      </div>
      <Link to={href} className="medium-row-thumb" aria-label={post.title}>
        {cover ? (
          <LazyImage src={cover} alt="" className="medium-row-thumb-img" />
        ) : (
          <div className="medium-row-thumb-img medium-image-placeholder" />
        )}
      </Link>
    </article>
  );
};

/* ─── Skeletons ───────────────────────────────────────────────────────────── */
const SkeletonRow = () => (
  <div className="medium-row medium-skeleton-row">
    <div className="medium-row-body">
      <div className="skeleton skeleton-text" style={{ width: '40%', height: 14 }} />
      <div className="skeleton skeleton-title mt-3" style={{ height: 22 }} />
      <div className="skeleton skeleton-text mt-2" style={{ width: '90%' }} />
      <div className="skeleton skeleton-text mt-2" style={{ width: '70%' }} />
    </div>
    <div className="medium-row-thumb">
      <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 6 }} />
    </div>
  </div>
);

/* ─── Main Blog page ──────────────────────────────────────────────────────── */
const Blog = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectAllBlogs);
  const status = useSelector(selectBlogsStatus);
  const error = useSelector(selectBlogsError);
  const pagination = useSelector(selectBlogsPagination);

  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBlogs({ page, category: activeCategory }));
  }, [dispatch, page, activeCategory]);

  const handleCategoryChange = (c) => {
    setActiveCategory(c);
    setPage(1);
  };

  const isLoading = status === 'idle' || status === 'loading';

  const categories = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => p.category && set.add(p.category));
    return ['All', activeCategory, ...Array.from(set)].filter(
      (c, i, arr) => arr.indexOf(c) === i
    );
  }, [posts, activeCategory]);

  const filtered = posts;

  const topTags = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 12);
  }, [posts]);

  const authors = useMemo(() => {
    const map = new Map();
    posts.forEach((p) => {
      const a = getAuthor(p);
      const key = a.id || a.name;
      if (!map.has(key)) map.set(key, a);
    });
    return Array.from(map.values()).slice(0, 5);
  }, [posts]);

  const [featured, ...rest] = filtered;

  return (
    <>
      <Helmet>
        <title>Our Blog – Latest Insights &amp; Trends | Nerdware</title>
        <meta
          name="description"
          content="Stay updated with the latest insights, trends, and tips from our experts in web development, mobile apps, and digital solutions."
        />
        <meta
          name="keywords"
          content="blog, web development, mobile apps, SEO, technology trends"
        />
        <link rel="canonical" href="https://nerdwaretechnologies.com/blog" />
        <meta property="og:title" content="Our Blog – Latest Insights & Trends | Nerdware" />
        <meta
          property="og:description"
          content="Stay updated with the latest insights, trends, and tips from our experts."
        />
        <meta property="og:url" content="https://nerdwaretechnologies.com/blog" />
        <meta property="og:type" content="website" />

        {/* Medium-style typography & layout — scoped to .medium-blog */}
        <style>{`
          html { scroll-behavior: smooth; }

          /* ── Light defaults ── */
          .medium-blog {
            --medium-border: rgba(0,0,0,0.08);
            --medium-muted: #6b6b6b;
            --medium-fg: #242424;
            --medium-bg: #ffffff;
            --medium-surface: #f2f2f2;
            --medium-surface-hover: #e6e6e6;
            --medium-chip-color: #333333;
            --medium-follow-border: #d1d1d1;
            --medium-follow-hover-bg: #f5f5f5;
            --medium-avatar-bg: #efefef;
            --medium-avatar-fallback-bg: #f1f1f1;
            --medium-image-placeholder: linear-gradient(135deg, #ececec, #f7f7f7);
            --medium-skeleton-from: #eeeeee;
            --medium-skeleton-to: #f5f5f5;
            --medium-tabs-bg: rgba(255,255,255,0.92);
            --medium-featured-image-bg: #f3f3f3;
            --medium-thumb-bg: #f3f3f3;
            font-family: 'Charter','Georgia','Cambria','Times New Roman',serif;
            color: var(--medium-fg);
          }

          /* ── Dark-theme overrides ── */
          @media (prefers-color-scheme: dark) {
            .medium-blog {
              --medium-border: rgba(255,255,255,0.1);
              --medium-muted: #9b9b9b;
              --medium-fg: #e8e8e8;
              --medium-bg: #0f0f0f;
              --medium-surface: #1e1e1e;
              --medium-surface-hover: #2a2a2a;
              --medium-chip-color: #cccccc;
              --medium-follow-border: #3a3a3a;
              --medium-follow-hover-bg: #1e1e1e;
              --medium-avatar-bg: #2a2a2a;
              --medium-avatar-fallback-bg: #1e1e1e;
              --medium-image-placeholder: linear-gradient(135deg, #1a1a1a, #222222);
              --medium-skeleton-from: #1a1a1a;
              --medium-skeleton-to: #252525;
              --medium-tabs-bg: rgba(15,15,15,0.92);
              --medium-featured-image-bg: #1a1a1a;
              --medium-thumb-bg: #1a1a1a;
            }
          }

          /* ── Also support explicit dark class (for apps that toggle via class) ── */
          .dark .medium-blog,
          [data-theme="dark"] .medium-blog,
          .medium-blog.dark {
            --medium-border: rgba(255,255,255,0.1);
            --medium-muted: #9b9b9b;
            --medium-fg: #e8e8e8;
            --medium-bg: #0f0f0f;
            --medium-surface: #1e1e1e;
            --medium-surface-hover: #2a2a2a;
            --medium-chip-color: #cccccc;
            --medium-follow-border: #3a3a3a;
            --medium-follow-hover-bg: #1e1e1e;
            --medium-avatar-bg: #2a2a2a;
            --medium-avatar-fallback-bg: #1e1e1e;
            --medium-image-placeholder: linear-gradient(135deg, #1a1a1a, #222222);
            --medium-skeleton-from: #1a1a1a;
            --medium-skeleton-to: #252525;
            --medium-tabs-bg: rgba(15,15,15,0.92);
            --medium-featured-image-bg: #1a1a1a;
            --medium-thumb-bg: #1a1a1a;
          }

          .medium-blog .medium-sans {
            font-family: 'Inter','Helvetica Neue',Arial,sans-serif;
          }

          /* ── Hero — tighter & cleaner ── */
          .medium-blog .medium-hero {
            border-bottom: 1px solid var(--medium-border);
            padding: 4.25rem 0 2.5rem;
          }
          .medium-blog .medium-eyebrow {
            font-family: 'Inter','Helvetica Neue',Arial,sans-serif;
            font-size: 0.75rem;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--medium-muted);
            display: inline-block;
            margin-bottom: 0.6rem;
          }
          .medium-blog .medium-hero-title {
            font-size: clamp(1.75rem, 3.2vw, 2.75rem);
            line-height: 1.08;
            letter-spacing: -0.02em;
            font-weight: 700;
            max-width: 720px;
            margin: 0;
            color: var(--medium-fg);
          }
          .medium-blog .medium-hero-sub {
            font-family: 'Inter','Helvetica Neue',Arial,sans-serif;
            font-size: 1rem;
            line-height: 1.55;
            color: var(--medium-muted);
            max-width: 580px;
            margin-top: 0.875rem;
          }

          /* ── Tabs ── */
          .medium-blog .medium-tabs {
            position: sticky;
            top: 0;
            z-index: 10;
            background: var(--medium-tabs-bg);
            backdrop-filter: saturate(180%) blur(8px);
            border-bottom: 1px solid var(--medium-border);
          }
          .medium-blog .medium-tabs-inner {
            display: flex;
            gap: 1.5rem;
            overflow-x: auto;
            padding: 0.85rem 0;
            font-family: 'Inter','Helvetica Neue',Arial,sans-serif;
            font-size: 0.875rem;
            scrollbar-width: none;
          }
          .medium-blog .medium-tabs-inner::-webkit-scrollbar { display: none; }
          .medium-blog .medium-tab {
            background: none;
            border: 0;
            padding: 0 0 6px;
            white-space: nowrap;
            color: var(--medium-muted);
            border-bottom: 2px solid transparent;
            cursor: pointer;
            transition: color .15s ease, border-color .15s ease;
          }
          .medium-blog .medium-tab:hover { color: var(--medium-fg); }
          .medium-blog .medium-tab.active {
            color: var(--medium-fg);
            border-bottom-color: var(--medium-fg);
            font-weight: 500;
          }

          /* ── Grid ── */
          .medium-blog .medium-grid {
            display: grid;
            grid-template-columns: minmax(0,1fr);
            gap: 3rem;
            padding: 3rem 0;
          }
          @media (min-width: 992px) {
            .medium-blog .medium-grid {
              grid-template-columns: minmax(0,1fr) 320px;
              gap: 4rem;
            }
          }

          /* ── Meta & avatar ── */
          .medium-blog .medium-meta {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-family: 'Inter','Helvetica Neue',Arial,sans-serif;
            font-size: 0.8125rem;
            color: var(--medium-muted);
          }
          .medium-blog .medium-meta-author { color: var(--medium-fg); font-weight: 500; }
          .medium-blog .medium-meta-dot { color: var(--medium-muted); }
          .medium-blog .medium-avatar {
            border-radius: 999px;
            object-fit: cover;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--medium-avatar-bg);
            color: var(--medium-fg);
            font-family: 'Inter',sans-serif;
            font-size: 10px;
            font-weight: 600;
            box-shadow: inset 0 0 0 1px var(--medium-border);
          }
          .medium-blog .medium-avatar-fallback { background: var(--medium-avatar-fallback-bg); }
          .medium-blog .medium-title-link { color: inherit; text-decoration: none; }
          .medium-blog .medium-title-link:hover h2,
          .medium-blog .medium-title-link:hover h3 {
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 4px;
          }

          /* ── Featured ── */
          .medium-blog .medium-featured {
            display: grid;
            grid-template-columns: minmax(0,1fr);
            gap: 1.75rem;
            padding-bottom: 2.5rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--medium-border);
          }
          @media (min-width: 768px) {
            .medium-blog .medium-featured {
              grid-template-columns: 1.1fr 1fr;
              gap: 3rem;
              align-items: center;
            }
          }
          .medium-blog .medium-featured-image-wrap {
            display: block;
            overflow: hidden;
            border-radius: 8px;
            background: var(--medium-featured-image-bg);
            aspect-ratio: 16/10;
          }
          .medium-blog .medium-featured-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform .5s ease;
          }
          .medium-blog .medium-featured-image-wrap:hover .medium-featured-image {
            transform: scale(1.02);
          }
          .medium-blog .medium-featured-title {
            font-size: clamp(1.75rem, 2.6vw, 2.25rem);
            line-height: 1.15;
            letter-spacing: -0.015em;
            font-weight: 700;
            margin: 0.25rem 0 0.75rem;
            color: var(--medium-fg);
          }
          .medium-blog .medium-featured-excerpt {
            font-size: 1.0625rem;
            line-height: 1.55;
            color: var(--medium-muted);
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          /* ── Row ── */
          .medium-blog .medium-row {
            display: grid;
            grid-template-columns: minmax(0,1fr) 112px;
            gap: 1.25rem;
            padding: 1.75rem 0;
            border-bottom: 1px solid var(--medium-border);
          }
          @media (min-width: 768px) {
            .medium-blog .medium-row {
              grid-template-columns: minmax(0,1fr) 180px;
              gap: 2.5rem;
            }
          }
          .medium-blog .medium-row-body { min-width: 0; }
          .medium-blog .medium-row-title {
            font-size: 1.375rem;
            line-height: 1.25;
            letter-spacing: -0.01em;
            font-weight: 700;
            margin: 0.5rem 0 0.4rem;
            color: var(--medium-fg);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          @media (min-width: 768px) {
            .medium-blog .medium-row-title { font-size: 1.5rem; }
          }
          .medium-blog .medium-row-excerpt {
            font-size: 1rem;
            line-height: 1.5;
            color: var(--medium-muted);
            margin: 0;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .medium-blog .medium-row-foot {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-top: 1rem;
            font-family: 'Inter','Helvetica Neue',Arial,sans-serif;
          }
          .medium-blog .medium-row-foot-text {
            font-size: 0.8125rem;
            color: var(--medium-muted);
          }
          .medium-blog .medium-chip {
            font-size: 0.75rem;
            padding: 4px 10px;
            background: var(--medium-surface);
            color: var(--medium-chip-color);
            border-radius: 999px;
          }
          .medium-blog .medium-row-thumb {
            display: block;
            aspect-ratio: 4/3;
            background: var(--medium-thumb-bg);
            border-radius: 4px;
            overflow: hidden;
          }
          .medium-blog .medium-row-thumb-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform .5s ease;
          }
          .medium-blog .medium-row-thumb:hover .medium-row-thumb-img {
            transform: scale(1.03);
          }
          .medium-blog .medium-image-placeholder {
            background: var(--medium-image-placeholder);
          }

          /* ── Sidebar ── */
          .medium-blog .medium-aside { font-family: 'Inter','Helvetica Neue',Arial,sans-serif; }
          .medium-blog .medium-aside-sticky {
            position: sticky;
            top: 80px;
            display: flex;
            flex-direction: column;
            gap: 2.5rem;
          }
          .medium-blog .medium-aside-title {
            font-size: 0.95rem;
            font-weight: 600;
            margin: 0 0 1rem;
            color: var(--medium-fg);
          }
          .medium-blog .medium-tag {
            display: inline-block;
            font-size: 0.8125rem;
            padding: 6px 14px;
            margin: 0 6px 8px 0;
            background: var(--medium-surface);
            color: var(--medium-chip-color);
            border-radius: 999px;
            cursor: pointer;
            transition: background .15s ease;
          }
          .medium-blog .medium-tag:hover { background: var(--medium-surface-hover); }
          .medium-blog .medium-author-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }
          .medium-blog .medium-author-name {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--medium-fg);
          }
          .medium-blog .medium-author-role {
            font-size: 0.75rem;
            color: var(--medium-muted);
          }
          .medium-blog .medium-follow {
            margin-left: auto;
            font-size: 0.8125rem;
            border: 1px solid var(--medium-follow-border);
            background: transparent;
            color: var(--medium-fg);
            padding: 4px 12px;
            border-radius: 999px;
            cursor: pointer;
            transition: background .15s ease;
          }
          .medium-blog .medium-follow:hover { background: var(--medium-follow-hover-bg); }

          /* ── Pagination ── */
          .medium-blog .medium-pagination {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1.25rem;
            padding: 2.5rem 0 1rem;
            font-family: 'Inter','Helvetica Neue',Arial,sans-serif;
          }
          .medium-blog .medium-page-btn {
            border: 1px solid var(--medium-follow-border);
            background: transparent;
            color: var(--medium-fg);
            padding: 8px 18px;
            border-radius: 999px;
            font-size: 0.875rem;
            cursor: pointer;
            transition: background .15s ease;
          }
          .medium-blog .medium-page-btn:hover:not(:disabled) { background: var(--medium-follow-hover-bg); }
          .medium-blog .medium-page-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }
          .medium-blog .medium-page-status {
            font-size: 0.8125rem;
            color: var(--medium-muted);
          }

          /* ── States ── */
          .medium-blog .medium-state {
            text-align: center;
            padding: 4rem 0;
            font-family: 'Inter',sans-serif;
            color: var(--medium-muted);
          }
          .medium-blog .skeleton {
            background: linear-gradient(90deg,
              var(--medium-skeleton-from) 0%,
              var(--medium-skeleton-to) 50%,
              var(--medium-skeleton-from) 100%);
            background-size: 200% 100%;
            animation: medium-shimmer 1.4s linear infinite;
            border-radius: 4px;
          }
          .medium-blog .skeleton-title { height: 18px; }
          .medium-blog .skeleton-text { height: 12px; }
          .medium-blog .medium-skeleton-row .skeleton { display: block; }
          @keyframes medium-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </Helmet>

      <main className="medium-blog">
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="medium-hero">
          <Container>
            <span className="medium-eyebrow">Our Journal</span>
            <h1 className="medium-hero-title">
              Stories, ideas, and deep dives from the people building the web.
            </h1>
            <p className="medium-hero-sub">
              Expert takes on web development, mobile, SEO, and the technologies
              shaping tomorrow, written by engineers, for engineers.
            </p>
          </Container>
        </section>

        {/* ── Category tabs ───────────────────────────────────────────────── */}
        {categories.length > 1 && (
          <div className="medium-tabs">
            <Container>
              <div className="medium-tabs-inner">
                {categories.map((c) => (
                  <button
                    key={c}
                    className={`medium-tab ${c === activeCategory ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Container>
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <Container>
          <div className="medium-grid">
            <div>
              {/* Error */}
              {status === 'failed' && (
                <div className="medium-state">
                  <h4 className="mb-2">Couldn't load posts</h4>
                  <p className="mb-4">{error}</p>
                  <button
                    className="btn btn-outline-dark btn-sm"
                    onClick={() => dispatch(fetchBlogs({ page, category: activeCategory }))}
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}

              {/* Empty */}
              {status === 'succeeded' && filtered.length === 0 && (
                <div className="medium-state">
                  No posts in this category yet. Check back soon.
                </div>
              )}

              {/* Featured + list */}
              {status === 'succeeded' && featured && (
                <>
                  <FeaturedPost post={featured} />
                  {rest.map((p) => (
                    <PostRow key={p._id || p.id} post={p} />
                  ))}
                </>
              )}

              {/* Pagination */}
              {status === 'succeeded' && pagination.pages > 1 && (
                <nav className="medium-pagination" aria-label="Blog pagination">
                  <button
                    className="medium-page-btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1}
                  >
                    ← Prev
                  </button>
                  <span className="medium-page-status">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    className="medium-page-btn"
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={pagination.page >= pagination.pages}
                  >
                    Next →
                  </button>
                </nav>
              )}
            </div>

            {/* Sidebar */}
            <aside className="medium-aside d-none d-lg-block">
              <div className="medium-aside-sticky">
                {topTags.length > 0 && (
                  <div>
                    <h4 className="medium-aside-title">Recommended topics</h4>
                    <div>
                      {topTags.map((t) => (
                        <span key={t} className="medium-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {authors.length > 0 && (
                  <div>
                    <h4 className="medium-aside-title">Who to follow</h4>
                    <ul className="list-unstyled m-0">
                      {authors.map((a) => (
                        <li key={a.id || a.name} className="medium-author-row">
                          <AuthorAvatar author={a} size={40} />
                          <div className="min-w-0">
                            <div className="medium-author-name">{a.name}</div>
                            <div className="medium-author-role">Writer</div>
                          </div>
                          <button className="medium-follow" type="button">Follow</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* Newsletter */}
          <Newsletter />
        </Container>
      </main>
    </>
  );
};

export default Blog;