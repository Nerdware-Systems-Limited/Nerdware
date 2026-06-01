import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import LazyImage from '../components/common/LazyImage';
import {
fetchBlogBySlug,
clearCurrentPost,
selectCurrentPost,
selectDetailStatus,
selectBlogsError,
} from '../redux/slices/Blogslice';
import SEO from '../components/common/SEO';
import Comments from '../components/blog/Comments';

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
const DetailSkeleton = () => (
<Container>
<Row className="justify-content-center">
<Col lg={8}>
<div className="skeleton skeleton-badge mb-3" style={{ width: 90, height: 22 }} />
<div className="skeleton skeleton-title mb-2" style={{ height: 36 }} />
<div className="skeleton skeleton-title mb-4" style={{ height: 36, width: '70%' }} />
<div className="d-flex gap-3 mb-4">
<div className="skeleton" style={{ width: 120, height: 16, borderRadius: 4 }} />
<div className="skeleton" style={{ width: 80,  height: 16, borderRadius: 4 }} />
</div>
<div className="skeleton skeleton-img mb-5" style={{ height: 380, borderRadius: 16 }} />
{[...Array(5)].map((_, i) => (
<div key={i} className="skeleton skeleton-text mb-2" style={{ width: i % 3 === 0 ? '80%' : '100%' }} />
))}
</Col>
</Row>
</Container>
);

/* ─── Tag pills ───────────────────────────────────────────────────────────── */
const TagPill = ({ tag }) => (
<span
style={{
display: 'inline-block',
padding: '4px 12px',
borderRadius: 'var(--radius-full)',
background: 'rgba(238,79,39,0.12)',
border: '1px solid rgba(238,79,39,0.25)',
color: 'var(--primary-color)',
fontSize: '0.8125rem',
fontWeight: 500,
marginRight: 6,
marginBottom: 6,
}}
>
#{tag}
</span>
);

/* ─── Blog Content Styles Component ──────────────────────────────────────── */
const BlogContentStyles = () => (
<style>{`
/* Typography */
.blog-post-content h1 {
font-size: 2rem; font-weight: 800; letter-spacing: -0.03em;
margin: 2rem 0 0.75rem; color: var(--text-primary);
line-height: 1.2;
}
.blog-post-content h2 {
font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em;
margin: 1.75rem 0 0.5rem; color: var(--text-primary);
line-height: 1.3;
}
.blog-post-content h3 {
font-size: 1.2rem; font-weight: 600;
margin: 1.5rem 0 0.4rem; color: var(--text-primary);
line-height: 1.4;
}
.blog-post-content h4, .blog-post-content h5, .blog-post-content h6 {
font-size: 1rem; font-weight: 600;
margin: 1.25rem 0 0.3rem; color: var(--text-primary);
}
.blog-post-content p { margin-bottom: 1.25rem; }
.blog-post-content strong { color: var(--text-primary); font-weight: 600; }
.blog-post-content em { font-style: italic; }
.blog-post-content u { text-decoration: underline; text-underline-offset: 3px; }
.blog-post-content s { text-decoration: line-through; opacity: 0.7; }

/* Links */
.blog-post-content a {
color: var(--primary-color);
text-decoration: underline;
text-underline-offset: 3px;
transition: opacity 0.2s;
}
.blog-post-content a:hover { opacity: 0.8; }

/* Blockquote */
.blog-post-content blockquote {
border-left: 3px solid var(--primary-color);
margin: 1.5rem 0;
padding: 1rem 1.5rem;
background: rgba(238,79,39,0.06);
border-radius: 0 8px 8px 0;
font-style: italic;
color: var(--text-muted);
}
.blog-post-content blockquote p:last-child { margin-bottom: 0; }

/* Code */
.blog-post-content code {
background: rgba(255,255,255,0.08);
padding: 2px 6px;
border-radius: 4px;
font-size: 0.875em;
font-family: 'Fira Code', 'Consolas', monospace;
color: #f59e0b;
}
.blog-post-content pre {
background: #0d0d0d;
border-radius: 10px;
padding: 20px 24px;
margin: 1.5rem 0;
overflow-x: auto;
border: 1px solid rgba(255,255,255,0.08);
}
.blog-post-content pre code {
background: none;
padding: 0;
color: #e5e5e5;
font-size: 0.9rem;
line-height: 1.6;
}

/* Lists */
.blog-post-content ul, .blog-post-content ol {
padding-left: 1.75rem;
margin: 1rem 0;
}
.blog-post-content li {
margin-bottom: 0.5rem;
line-height: 1.7;
}
.blog-post-content ul li::marker { color: var(--primary-color); }
.blog-post-content ol li::marker { color: var(--primary-color); }
.blog-post-content ul ul, .blog-post-content ol ol,
.blog-post-content ul ol, .blog-post-content ol ul {
margin: 0.5rem 0;
}

/* Horizontal rule */
.blog-post-content hr {
border: none;
border-top: 1px solid var(--border-subtle);
margin: 2.5rem 0;
}

/* Images */
.blog-post-content img {
max-width: 100%;
border-radius: 10px;
margin: 1.5rem 0;
display: block;
border: 1px solid var(--border-subtle);
}
.blog-post-content figure {
margin: 1.5rem 0;
}
.blog-post-content figcaption {
text-align: center;
font-size: 0.875rem;
color: var(--text-muted);
margin-top: 0.75rem;
}

/* YouTube embed */
.blog-post-content div[data-youtube-video] {
margin: 1.5rem 0;
border-radius: 12px;
overflow: hidden;
}
.blog-post-content iframe {
border-radius: 12px;
width: 100%;
aspect-ratio: 16/9;
display: block;
border: none;
}

/* Tables */
.blog-post-content table {
width: 100%;
border-collapse: collapse;
margin: 1.5rem 0;
font-size: 0.95rem;
overflow: hidden;
border-radius: 8px;
border: 1px solid var(--border-subtle);
}
.blog-post-content th {
background: rgba(238,79,39,0.1);
color: var(--text-primary);
font-weight: 600;
padding: 12px 16px;
border: 1px solid var(--border-subtle);
text-align: left;
}
.blog-post-content td {
padding: 12px 16px;
border: 1px solid var(--border-subtle);
color: var(--text-secondary);
vertical-align: top;
}
.blog-post-content tr:nth-child(even) td {
background: rgba(255,255,255,0.02);
}

/* Text alignment */
.blog-post-content [style*="text-align: center"],
.blog-post-content [style*="text-align:center"] { text-align: center; }
.blog-post-content [style*="text-align: right"],
.blog-post-content [style*="text-align:right"] { text-align: right; }
.blog-post-content [style*="text-align: justify"],
.blog-post-content [style*="text-align:justify"] { text-align: justify; }

/* First element spacing */
.blog-post-content > *:first-child { margin-top: 0; }
.blog-post-content > *:last-child { margin-bottom: 0; }
`}</style>
);

/* ─── Main component ────────────────────────────────────────────────────── */
const BlogDetail = () => {
const { slug }   = useParams();
const dispatch   = useDispatch();
const post       = useSelector(selectCurrentPost);
const status     = useSelector(selectDetailStatus);
const error      = useSelector(selectBlogsError);

useEffect(() => {
dispatch(fetchBlogBySlug(slug));
return () => dispatch(clearCurrentPost());
}, [dispatch, slug]);

const isLoading = status === 'idle' || status === 'loading';

const formatDate = (str) =>
str
? new Date(str).toLocaleDateString(undefined, {
year: 'numeric', month: 'long', day: 'numeric',
})
: '';

return (
<>
{/* Blog content styles */}
<BlogContentStyles />

{post && (
        <SEO
          title={post.title}
          description={post.excerpt}
          image={post.coverImage}
          url={`/blog/${post.slug}`}
          type="article"
          article={{
            publishedAt: post.publishedAt || post.createdAt,
            updatedAt:   post.updatedAt,
            author:      post.author?.name,
            tags:        post.tags,
            category:    post.category,
            readTime:    post.readTime || post.read_time,
          }}
        />
      )}

<main>
{/* ── Page header spacer ──────────────────────────────────────────── */}
<div style={{ paddingTop: 100, background: 'var(--bg-midnight)' }} />

<section style={{ background: 'var(--bg-midnight)', paddingBottom: 80 }}>

{/* Loading */}
{isLoading && (
<div style={{ paddingTop: 40 }}>
<DetailSkeleton />
</div>
)}

{/* Error */}
{status === 'failed' && (
<Container>
<Row className="justify-content-center text-center py-5">
<Col lg={6}>
<h4 className="mb-2">Couldn't load this post</h4>
<p className="text-muted mb-4">{error}</p>
<Link to="/blog" className="btn btn-outline-primary">← Back to Blog</Link>
</Col>
</Row>
</Container>
)}

{/* Post */}
{status === 'succeeded' && post && (
<Container>
<Row className="justify-content-center">
<Col lg={8}>

{/* Back link */}
<Link
to="/blog"
className="text-muted d-inline-flex align-items-center gap-1 mb-4 fade-in-up"
style={{ fontSize: '0.9rem', transition: 'color 0.2s' }}
onMouseEnter={(e) => (e.target.style.color = 'var(--text-primary)')}
onMouseLeave={(e) => (e.target.style.color = '')}
>
← Back to Blog
</Link>

{/* Category */}
{post.category && (
<div className="mb-3 fade-in-up">
<Badge
style={{
background: 'var(--primary-gradient)',
fontSize: '0.75rem',
fontWeight: 600,
padding: '5px 12px',
borderRadius: 'var(--radius-full)',
letterSpacing: '0.02em',
}}
>
{post.category}
</Badge>
</div>
)}

{/* Title */}
<h1
className="fade-in-up"
style={{
fontSize: 'clamp(2rem, 4vw, 3rem)',
fontWeight: 800,
letterSpacing: '-0.03em',
marginBottom: '1rem',
lineHeight: 1.1,
color: 'var(--text-primary)',
}}
>
{post.title}
</h1>

{/* Excerpt */}
{post.excerpt && (
<p
className="lead fade-in-up"
style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginBottom: '1.5rem' }}
>
{post.excerpt}
</p>
)}

{/* Meta row */}
<div
className="d-flex flex-wrap align-items-center gap-3 mb-5 fade-in-up"
style={{
paddingBottom: '1.5rem',
borderBottom: '1px solid var(--border-subtle)',
}}
>
{post.author?.name && (
<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
<span
style={{
width: 32, height: 32, borderRadius: '50%',
background: 'var(--primary-gradient)',
display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
fontSize: '0.875rem', fontWeight: 700, color: '#fff', flexShrink: 0,
}}
>
{post.author.name[0]}
</span>
<span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
{post.author.name}
</span>
</span>
)}
<span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
{formatDate(post.publishedAt || post.createdAt)}
</span>
{(post.readTime || post.read_time) && (
<span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
· {post.readTime || post.read_time} min read
</span>
)}
</div>

{/* Cover image */}
{post.coverImage && (
<div
className="fade-in-up mb-5"
style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
>
<LazyImage
src={post.coverImage}
alt={post.title}
className="w-100"
style={{ maxHeight: 420, objectFit: 'cover' }}
/>
</div>
)}

{/* Content */}
{post.content ? (
<div
className="fade-in-up blog-post-content"
style={{
color: 'var(--text-secondary)',
fontSize: '1.0625rem',
lineHeight: 1.85,
}}
dangerouslySetInnerHTML={{ __html: post.content }}
/>
) : (
<p className="text-muted fst-italic">No content available.</p>
)}

{/* Tags */}
{post.tags?.length > 0 && (
<div
className="mt-5 pt-4 fade-in-up"
style={{ borderTop: '1px solid var(--border-subtle)' }}
>
<p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 10 }}>
Tagged:
</p>
<div>
{post.tags.map((tag) => (
<TagPill key={tag} tag={tag} />
))}
</div>
</div>
)}

<Comments blogId={post.id} />

{/* Back CTA */}
<div className="mt-5 pt-3 fade-in-up">
<Link to="/blog" className="btn btn-outline-primary">
← More Articles
</Link>
</div>

</Col>
</Row>
</Container>
)}
</section>
</main>
</>
);
};

export default BlogDetail;