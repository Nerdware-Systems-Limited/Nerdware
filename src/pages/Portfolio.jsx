import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import LazyImage from '../components/common/LazyImage';
import SEO from '../components/common/SEO';
import {
  fetchPortfolios,
  selectAllPortfolios,
  selectPortfoliosStatus,
  selectPortfoliosError,
} from '../redux/slices/portfolioSlice';

/* ─── Fallback placeholder when coverImage is null ───────────────────────── */
const PLACEHOLDER = `https://api.microlink.io/?url=${encodeURIComponent(
  'https://nerdwaretechnologies.com'
)}&screenshot=true&embed=screenshot.url`;

/* ─── Map API category strings → filter keys ─────────────────────────────── */
const categoryToKey = (category = '') => {
  const lower = category.toLowerCase();
  if (lower.includes('mobile')) return 'mobile';
  if (lower.includes('seo'))    return 'seo';
  if (lower.includes('data') || lower.includes('ai')) return 'data';
  return 'web';
};

/* ─── Skeleton card ───────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <Col lg={4} md={6} className="mb-4">
    <div className="portfolio-card skeleton-card h-100">
      <div className="skeleton skeleton-img" />
      <div className="p-4">
        <div className="skeleton skeleton-badge mb-3" />
        <div className="skeleton skeleton-title mb-2" />
        <div className="skeleton skeleton-title mb-4" style={{ width: '60%' }} />
        <div className="skeleton skeleton-text mb-2" />
        <div className="skeleton skeleton-text" style={{ width: '75%' }} />
      </div>
    </div>
  </Col>
);

/* ─── Individual portfolio card ───────────────────────────────────────────── */
const PortfolioCard = ({ project }) => {
  const href = project.liveUrl || project.githubUrl || '#';
  const imageSrc = project.coverImage || PLACEHOLDER;

  return (
    <Col lg={4} md={6} className="mb-4 fade-in-up">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-decoration-none d-block h-100"
      >
        <Card className="portfolio-card h-100 border-0">
          {/* Image */}
          <div style={{ overflow: 'hidden' }}>
            <LazyImage
              src={imageSrc}
              alt={project.title}
              className="portfolio-image img-fluid w-100"
            />
          </div>

          <Card.Body className="p-4 d-flex flex-column">
            {/* Category badge */}
            <div className="mb-2">
              <Badge className="blog-category-badge position-static">
                {project.category}
              </Badge>
            </div>

            <Card.Title as="h3" className="h5 mb-2">
              {project.title}
            </Card.Title>

            <Card.Text className="mb-3 flex-grow-1">
              {project.description}
            </Card.Text>

            {/* Tech stack */}
            <div className="portfolio-technologies">
              {(project.technologies || []).map((tech, i) => (
                <Badge key={i} className="me-1 mb-1">
                  {tech}
                </Badge>
              ))}
            </div>
          </Card.Body>

          {/* Footer links */}
          {(project.liveUrl || project.githubUrl) && (
            <Card.Footer className="bg-transparent border-0 px-4 pb-4 pt-0">
              <div className="d-flex gap-2">
                {project.liveUrl && (
                  <span className="btn btn-primary btn-sm">
                    View Live →
                  </span>
                )}
                {project.githubUrl && (
                  <span className="btn btn-secondary-dark btn-sm">
                    GitHub
                  </span>
                )}
              </div>
            </Card.Footer>
          )}
        </Card>
      </a>
    </Col>
  );
};

/* ─── Main Portfolio page ─────────────────────────────────────────────────── */
const Portfolio = () => {
  const dispatch  = useDispatch();
  const projects  = useSelector(selectAllPortfolios);
  const status    = useSelector(selectPortfoliosStatus);
  const error     = useSelector(selectPortfoliosError);

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPortfolios());
    }
  }, [dispatch, status]);

  const isLoading = status === 'idle' || status === 'loading';

  /* Derive unique filter tabs from loaded data + always show "All" */
  const categories = [
    { key: 'all', label: 'All Projects' },
    ...Array.from(
      new Map(
        projects.map((p) => [
          categoryToKey(p.category),
          { key: categoryToKey(p.category), label: p.category },
        ])
      ).values()
    ),
  ];

  const filtered =
    filter === 'all'
      ? projects
      : projects.filter((p) => categoryToKey(p.category) === filter);

  return (
    <>
      <SEO
        title="Our Portfolio"
        description="Explore our recent projects and success stories in web development, mobile apps, and SEO."
        keywords="portfolio, web development, mobile apps, SEO, projects"
        url="/portfolio"
      />

      <main>
        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="page-header py-5 mb-5">
          <Container>
            <Row className="justify-content-center text-center">
              <Col lg={7}>
                <p
                  className="text-primary fw-semibold mb-2 text-uppercase"
                  style={{ letterSpacing: '0.1em', fontSize: '0.875rem' }}
                >
                  Our Work
                </p>
                <h1 className="display-4 mb-3">
                  Projects &amp; <span className="text-gradient">Success Stories</span>
                </h1>
                <p className="lead">
                  Explore what we've built from e-commerce platforms to mobile apps
                  and AI-powered dashboards.
                </p>
              </Col>
            </Row>
          </Container>
        </section>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <section className="portfolio-content py-5">
          <Container>

            {/* Filter tabs — only show once data is loaded */}
            {status === 'succeeded' && projects.length > 0 && (
              <Row className="justify-content-center mb-5">
                <Col lg={8}>
                  <div className="portfolio-filters text-center">
                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        className={`btn ${
                          filter === cat.key ? 'btn-primary' : 'btn-outline-primary'
                        } mx-2 mb-2`}
                        onClick={() => setFilter(cat.key)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </Col>
              </Row>
            )}

            {/* Error state */}
            {status === 'failed' && (
              <Row>
                <Col className="text-center py-5">
                  <h4 className="mt-3 mb-2">Couldn't load projects</h4>
                  <p className="mb-4">{error}</p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => dispatch(fetchPortfolios())}
                  >
                    Try again
                  </button>
                </Col>
              </Row>
            )}

            {/* Skeletons */}
            {isLoading && (
              <Row>
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </Row>
            )}

            {/* Grid */}
            {status === 'succeeded' && filtered.length > 0 && (
              <Row>
                {filtered.map((project) => (
                  <PortfolioCard key={project.id} project={project} />
                ))}
              </Row>
            )}

            {/* Empty */}
            {status === 'succeeded' && filtered.length === 0 && (
              <Row>
                <Col className="text-center py-5">
                  <p>No projects found for this category.</p>
                </Col>
              </Row>
            )}

          </Container>
        </section>
      </main>
    </>
  );
};

export default Portfolio;