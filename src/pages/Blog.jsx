import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import LazyImage from '../components/common/LazyImage';
import {
  fetchBlogs,
  selectAllBlogs,
  selectBlogsStatus,
  selectBlogsError,
} from '../redux/slices/Blogslice';
import { Link } from 'react-router-dom';
import Newsletter from '../components/common/Newsletter';

/* ─── Skeleton card shown while loading ──────────────────────────────────── */
const SkeletonCard = () => (
  <Col lg={4} md={6} className="mb-5">
    <div className="blog-card skeleton-card h-100">
      <div className="skeleton skeleton-img" />
      <div className="p-4">
        <div className="skeleton skeleton-badge mb-3" />
        <div className="skeleton skeleton-title mb-2" />
        <div className="skeleton skeleton-title mb-2" style={{ width: '70%' }} />
        <div className="skeleton skeleton-text mt-3 mb-1" />
        <div className="skeleton skeleton-text" style={{ width: '80%' }} />
      </div>
    </div>
  </Col>
);

/* ─── Individual blog card ────────────────────────────────────────────────── */
const BlogCard = ({ post }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <Col lg={4} md={6} className="mb-5 fade-in-up">
      <Card className="blog-card h-100 border-0">
        <div className="blog-image-wrapper">
          <LazyImage
            src={post.coverImage || post.image || post.imageUrl || post.thumbnail}
            alt={post.title}
            className="blog-image w-100"
          />
          {post.category && (
            <Badge className="blog-category-badge">{post.category}</Badge>
          )}
        </div>

        <Card.Body className="p-4 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small>
              {(post.readTime || post.read_time)
                ? `${post.readTime || post.read_time} min read`
                : null}
            </small>
            <small>{formatDate(post.publishedAt || post.date || post.createdAt)}</small>
          </div>

          <Card.Title as="h3" className="h5 mb-3 blog-card-title">
            {post.title}
          </Card.Title>

          <Card.Text className="mb-3 flex-grow-1 blog-card-excerpt">
            {post.excerpt || post.summary || post.description}
          </Card.Text>

          <div className="blog-meta d-flex justify-content-between align-items-center mt-auto">
            {(post.author || post.authorName) && (
              <small>
                By <span className="text-primary">
                  {post.author?.name || post.authorName || post.author}
                </span>
              </small>
            )}
          </div>
        </Card.Body>
        <Link to={post.url || post.link || post.slug} target="_blank" className="stretched-link">
        <Card.Footer className="bg-transparent border-0 px-4 pb-4 pt-0">
          <button className="btn btn-outline-primary btn-sm">
            Read Article →
          </button>
        </Card.Footer>
        </Link>
      </Card>
    </Col>
  );
};

/* ─── Main Blog page ──────────────────────────────────────────────────────── */
const Blog = () => {
  const dispatch = useDispatch();
  const posts    = useSelector(selectAllBlogs);
  const status   = useSelector(selectBlogsStatus);
  const error    = useSelector(selectBlogsError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBlogs());
    }
  }, [dispatch, status]);

  const isLoading = status === 'idle' || status === 'loading';

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
      </Helmet>

      <main>
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="page-header py-5 mb-5">
          <Container>
            <Row className="justify-content-center text-center">
              <Col lg={7}>
                <p className="text-primary fw-semibold mb-2 text-uppercase" style={{ letterSpacing: '0.1em', fontSize: '0.875rem' }}>
                  Our Journal
                </p>
                <h1 className="display-4 mb-3">
                  Insights &amp; <span className="text-gradient">Perspectives</span>
                </h1>
                <p className="lead">
                  Stay ahead with expert takes on web development, mobile, SEO, and
                  the technologies shaping tomorrow.
                </p>
              </Col>
            </Row>
          </Container>
        </section>

        {/* ── Posts grid ─────────────────────────────────────────────────── */}
        <section className="blog-content py-5">
          <Container>

            {/* Error state */}
            {status === 'failed' && (
              <Row>
                <Col className="text-center py-5">
                  <h4 className="mt-3 mb-2">Couldn't load posts</h4>
                  <p className="mb-4">{error}</p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => {
                      // Force reset and refetch
                      dispatch(fetchBlogs());
                    }}
                  >
                    Try again
                  </button>
                </Col>
              </Row>
            )}

            {/* Loading skeletons */}
            {isLoading && (
              <Row>
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </Row>
            )}

            {/* Populated grid */}
            {status === 'succeeded' && posts.length > 0 && (
              <Row>
                {posts.map((post) => (
                  <BlogCard key={post._id || post.id} post={post} />
                ))}
              </Row>
            )}

            {/* Empty state */}
            {status === 'succeeded' && posts.length === 0 && (
              <Row>
                <Col className="text-center py-5">
                  <p>No posts published yet — check back soon.</p>
                </Col>
              </Row>
            )}

            {/* ── Newsletter ─────────────────────────────────────────────── */}
            <Newsletter />

          </Container>
        </section>
      </main>
    </>
  );
};

export default Blog;