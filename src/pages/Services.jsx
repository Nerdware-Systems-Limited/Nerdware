import { useState, useEffect, useRef } from 'react';
import SEO from '../components/common/SEO';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaLaptopCode, FaMobileAlt, FaSearch, FaCheck,
  FaChartBar, FaRobot, FaProjectDiagram, FaUserTie, FaArrowRight
} from 'react-icons/fa';

/* ── Inline styles (no extra CSS file needed) ─────────────────────────── */
const S = {
  /* hero */
  hero: {
    padding: 'clamp(90px,14vw,140px) 0 clamp(50px,8vw,90px)',
    background: 'var(--bg-midnight)',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(238,79,39,0.12)',
    border: '1px solid rgba(238,79,39,0.3)',
    borderRadius: 'var(--radius-full)',
    padding: '6px 18px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--primary-color)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: '1.5rem',
  },
  heroDot: {
    width: 8, height: 8,
    borderRadius: '50%',
    background: 'var(--primary-color)',
    display: 'inline-block',
    animation: 'pulse 2s infinite',
  },
  heroTitle: {
    fontSize: 'clamp(1.75rem,7vw,5.5rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    color: 'var(--text-primary)',
    marginBottom: '1.5rem',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  heroSub: {
    fontSize: '1.125rem',
    color: 'var(--text-muted)',
    maxWidth: 620,
    margin: '0 auto 2.5rem',
    lineHeight: 1.7,
  },
  heroCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--primary-gradient)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '0.75rem 2rem',
    fontWeight: 700,
    fontSize: '0.9375rem',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    textDecoration: 'none',
  },

  /* grid intro */
  sectionLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--primary-color)',
    marginBottom: '0.75rem',
  },
  sectionTitle: {
    fontSize: 'clamp(1.5rem,4vw,3rem)',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: 'var(--text-primary)',
    lineHeight: 1.15,
    marginBottom: '1rem',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  sectionDesc: {
    color: 'var(--text-muted)',
    fontSize: '1.0625rem',
    lineHeight: 1.75,
    maxWidth: 560,
  },

  /* service card */
  card: {
    background: 'var(--bg-dark-navy)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    height: '100%',
    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default',
  },
  cardAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
    borderRadius: '999px 999px 0 0',
  },
  iconWrap: {
    width: 56, height: 56,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.25rem',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-display)',
    letterSpacing: '-0.02em',
  },
  cardDesc: {
    color: 'var(--text-muted)',
    fontSize: '0.9375rem',
    lineHeight: 1.65,
    marginBottom: '1.5rem',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '6px 0',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  /* new badge on card */
  newBadge: {
    position: 'absolute',
    top: 16, right: 16,
    background: 'var(--primary-gradient)',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: 800,
    letterSpacing: '0.1em',
    padding: '3px 10px',
    borderRadius: 'var(--radius-full)',
    textTransform: 'uppercase',
  },

  /* process */
  processSection: {
    background: 'var(--bg-midnight)',
    padding: '100px 0',
    position: 'relative',
  },
  processCard: {
    background: 'var(--bg-dark-navy)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  stepNum: {
    width: 52, height: 52,
    background: 'var(--primary-gradient)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: '1.25rem',
    color: '#fff',
    margin: '0 auto 1.25rem',
    boxShadow: '0 6px 20px rgba(238,79,39,0.4)',
  },
  connector: {
    position: 'absolute',
    top: '50%',
    right: '-18%',
    width: '36%',
    height: 1,
    background: 'linear-gradient(90deg, rgba(238,79,39,0.5), rgba(238,79,39,0.08))',
    zIndex: 0,
  },

  /* CTA banner */
  ctaBanner: {
    background: 'linear-gradient(135deg, rgba(238,79,39,0.18) 0%, rgba(107,33,239,0.12) 100%)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
    padding: 'clamp(32px,6vw,60px) clamp(20px,5vw,48px)',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    margin: '0 0 80px',
  },
};

/* ── Service data ──────────────────────────────────────────────────────── */
const services = [
  {
    id: 1,
    title: 'Web Development',
    description: 'Bespoke web applications built to scale, from landing pages to complex SaaS platforms.',
    icon: <FaLaptopCode size={26} />,
    color: '#3b82f6',
    features: [
      'Responsive & accessible UI',
      'E-commerce & payment integration',
      'Headless CMS solutions',
      'Custom web apps & dashboards',
      'REST & GraphQL APIs',
      'Database design & optimisation',
    ],
    isNew: false,
  },
  {
    id: 2,
    title: 'Mobile Development',
    description: 'Native and cross-platform apps that deliver exceptional experiences on every device.',
    icon: <FaMobileAlt size={26} />,
    color: '#8b5cf6',
    features: [
      'iOS & Android development',
      'Cross-platform with one codebase',
      'Offline-first architecture',
      'Push notifications & analytics',
      'App Store & Play Store launch',
      'Ongoing maintenance & updates',
    ],
    isNew: false,
  },
  {
    id: 3,
    title: 'Search Engine Optimisation',
    description: 'Data-driven SEO strategies that move the needle, from technical audits to content authority.',
    icon: <FaSearch size={26} />,
    color: '#10b981',
    features: [
      'Full technical SEO audit',
      'Keyword research & intent mapping',
      'Content strategy & copywriting',
      'Link-building campaigns',
      'Local & map-pack optimisation',
      'Monthly performance reporting',
    ],
    isNew: false,
  },
  {
    id: 4,
    title: 'Data Analysis',
    description: 'Transform raw data into strategic intelligence: interactive dashboards, predictive models, and boardroom-ready reports.',
    icon: <FaChartBar size={26} />,
    color: '#f59e0b',
    features: [
      'Data cleaning & pipeline setup',
      'Interactive dashboards & reports',
      'Predictive & prescriptive analytics',
      'KPI design & monitoring',
      'Custom data visualisations',
      'Business intelligence integration',
    ],
    isNew: false,
  },
  {
    id: 5,
    title: 'Workflow Automation',
    description: 'Eliminate busywork. We map, script, and orchestrate your processes so your team focuses on high-value work.',
    icon: <FaProjectDiagram size={26} />,
    color: '#ee4f27',
    features: [
      'End-to-end process mapping',
      'Multi-step workflow scripting',
      'Tool & API integrations',
      'Automated reporting & alerts',
      'Task scheduling & monitoring',
      'Efficiency & ROI analysis',
    ],
    isNew: true,
  },
  {
    id: 6,
    title: 'Automations & Bots',
    description: 'Custom bots and RPA scripts that handle your repetitive digital tasks 24/7 without human intervention.',
    icon: <FaRobot size={26} />,
    color: '#06b6d4',
    features: [
      'Web scraping & data collection',
      'Browser & UI automation',
      'Custom bot development',
      'Scheduled task execution',
      'Error handling & alerts',
      'Cost & time savings audit',
    ],
    isNew: false,
  },
  {
    id: 7,
    title: 'Digital Employees: AI Agents',
    description: 'Deploy intelligent AI agents that think, reason, and act like a specialist team member, available 24/7 at a fraction of the cost.',
    icon: <FaUserTie size={26} />,
    color: '#fd8925',
    features: [
      'Custom LLM-powered agents',
      'Retrieval-augmented knowledge bases',
      'Multi-agent orchestration',
      'Voice & chat AI assistants',
      'CRM & inbox automation agents',
      'Continuous learning & fine-tuning',
    ],
    isNew: true,
  },
];

const process = [
  { n: '01', title: 'Discovery', desc: 'Deep-dive into your goals, constraints, and existing systems.' },
  { n: '02', title: 'Strategy', desc: 'We design a detailed roadmap with milestones and success metrics.' },
  { n: '03', title: 'Build', desc: 'Agile sprints with regular demos, so you see progress every week.' },
  { n: '04', title: 'Launch & Scale', desc: 'Deployment, handover, monitoring, and ongoing growth support.' },
];

/* ── Intersection Observer hook ───────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Sub-components ───────────────────────────────────────────────────── */
function ServiceCard({ service, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  const [ref, visible] = useInView();

  const cardStyle = {
    ...S.card,
    borderColor: hovered ? `${service.color}40` : 'var(--border-subtle)',
    transform: hovered ? 'translateY(-8px)' : visible ? 'translateY(0)' : 'translateY(28px)',
    boxShadow: hovered ? `0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px ${service.color}30` : 'none',
    opacity: visible ? 1 : 0,
    transition: hovered
      ? 'all 0.3s cubic-bezier(0.4,0,0.2,1)'
      : `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms, border-color 0.3s ease, box-shadow 0.3s ease`,
  };

  const iconBg = hovered
    ? `${service.color}30`
    : `${service.color}18`;

  return (
    <div
      ref={ref}
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* top accent bar */}
      <div style={{ ...S.cardAccent, background: hovered ? service.color : 'transparent', transition: 'background 0.3s' }} />

      {service.isNew && <span style={S.newBadge}>New</span>}

      {/* icon */}
      <div style={{ ...S.iconWrap, background: iconBg, color: service.color, transition: 'background 0.3s' }}>
        {service.icon}
      </div>

      <h3 style={S.cardTitle}>{service.title}</h3>
      <p style={S.cardDesc}>{service.description}</p>

      {/* features */}
      <div>
        {service.features.map((f, i) => (
          <div key={i} style={{ ...S.featureItem, borderBottomColor: i === service.features.length - 1 ? 'transparent' : undefined }}>
            <FaCheck size={11} style={{ color: service.color, marginTop: 3, flexShrink: 0 }} />
            {f}
          </div>
        ))}
      </div>

    </div>
  );
}

function ProcessStep({ step, index, total }) {
  const [hovered, setHovered] = useState(false);
  const [ref, visible] = useInView();
  return (
    <Col md={3} className="mb-4" style={{ position: 'relative' }}>
      {/* connector line between steps */}
      {index < total - 1 && (
        <div style={S.connector} />
      )}
      <div
        ref={ref}
        style={{
          ...S.processCard,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          opacity: visible ? 1 : 0,
          transition: `opacity 0.5s ease ${index * 120}ms, transform 0.5s ease ${index * 120}ms, border-color 0.3s`,
          borderColor: hovered ? 'rgba(238,79,39,0.35)' : 'var(--border-subtle)',
          position: 'relative', zIndex: 1,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={S.stepNum}>{step.n}</div>
        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.125rem' }}>
          {step.title}
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
      </div>
    </Col>
  );
}

/* ── Floating orbs background ─────────────────────────────────────────── */
const Orb = ({ style }) => (
  <div style={{
    position: 'absolute', borderRadius: '50%',
    filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
    ...style,
  }} />
);

/* ── Main component ───────────────────────────────────────────────────── */
const Services = () => {
  const [gridRef, gridVisible] = useInView(0.05);

  return (
    <>
      <SEO
        title="Our Services"
        description="Web development, mobile apps, SEO, data analysis, workflow automation, and AI agents, comprehensive digital solutions."
        keywords="web development, mobile apps, SEO, data analysis, workflow automation, AI agents, digital employees"
        url="/services"
      />

      {/* global keyframes injected once */}
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50% { opacity:0.6; transform:scale(1.4); }
        }
        @keyframes floatY {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-18px); }
        }
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .svc-cta-btn:hover {
          opacity: 0.88 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 32px rgba(238,79,39,0.45) !important;
        }
        .svc-outline-btn:hover {
          background: rgba(255,255,255,0.08) !important;
          color: #fff !important;
        }

        /* ── Global overflow guard ───────────────────────────────── */
        html, body { max-width: 100%; overflow-x: hidden; }

        /* ── Mobile: ≤ 767px ─────────────────────────────────────── */
        @media (max-width: 767px) {

          /* Stat bar: 2×2 grid instead of horizontal row */
          .svc-stat-bar {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0 !important;
          }
          .svc-stat-item {
            padding: 1.25rem 0.75rem !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          }
          .svc-stat-item:nth-child(odd)  { border-right: 1px solid rgba(255,255,255,0.06) !important; }
          .svc-stat-item:nth-last-child(-n+2) { border-bottom: none !important; }

          /* AI agents: single column */
          .svc-agents-grid { grid-template-columns: 1fr !important; }

          /* Sections: reduce vertical padding */
          .svc-section-pad { padding: 60px 0 !important; }

          /* CTA buttons: full-width stacked */
          .svc-btn-row { flex-direction: column !important; align-items: stretch !important; }
          .svc-cta-btn, .svc-outline-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        /* ── Small mobile: ≤ 480px ───────────────────────────────── */
        @media (max-width: 480px) {
          .svc-agents-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main>
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section style={S.hero}>
          <Orb style={{ top: '-10%', right: '-5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(238,79,39,0.13) 0%, transparent 70%)' }} />
          <Orb style={{ bottom: '-5%', left: '-8%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(107,33,239,0.1) 0%, transparent 70%)' }} />
          <Orb style={{ top: '30%', left: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(253,137,37,0.07) 0%, transparent 70%)', animation: 'floatY 7s ease-in-out infinite' }} />

          <Container style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ animation: 'fadeInUp 0.7s ease both' }}>
              <div style={S.heroBadge}>
                <span style={S.heroDot} />
                Full-Stack Digital Solutions
              </div>
            </div>

            <h1 style={{ ...S.heroTitle, animation: 'fadeInUp 0.7s ease 0.1s both' }}>
              Everything Your Business Needs{' '}
              <span style={{
                background: 'var(--primary-gradient)',
                backgroundSize: '200% 200%',
                animation: 'gradShift 4s ease infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                to Dominate Online
              </span>
            </h1>

            <p style={{ ...S.heroSub, animation: 'fadeInUp 0.7s ease 0.2s both' }}>
              From custom software and SEO to AI-powered digital employees that work around the clock,
              we build, automate, and scale your competitive edge.
            </p>

            <div className="svc-btn-row" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 0.7s ease 0.3s both' }}>
              <a href="/contact" className="svc-cta-btn" style={{ ...S.heroCta, transition: 'all 0.25s ease' }}>
                Start a Project <FaArrowRight size={14} />
              </a>
              <a href="#services-grid" className="svc-outline-btn" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: '1px solid var(--border-medium)',
                color: 'var(--text-secondary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 2rem',
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                textDecoration: 'none',
                background: 'transparent',
              }}>
                Explore Services
              </a>
            </div>

            {/* stat bar */}
            <div className="svc-stat-bar" style={{
              display: 'flex',
              gap: 0,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '4rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '2rem',
              animation: 'fadeInUp 0.7s ease 0.45s both',
            }}>
              {[['50+', 'Projects Delivered'], ['7', 'Core Services'], ['24/7', 'AI Agents Available'], ['98%', 'Client Satisfaction']].map(([num, label]) => (
                <div key={label} className="svc-stat-item" style={{
                  padding: '0 2.5rem',
                  borderRight: '1px solid var(--border-subtle)',
                  textAlign: 'center',
                  flex: '1 1 140px',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 'clamp(1.75rem,3vw,2.5rem)',
                    letterSpacing: '-0.03em',
                    background: 'var(--primary-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>{num}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── SERVICES GRID ─────────────────────────────────────────── */}
        <section id="services-grid" className="svc-section-pad" style={{ padding: '100px 0', background: 'var(--bg-midnight)', position: 'relative' }}>
          <Orb style={{ top: '20%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(253,137,37,0.06) 0%, transparent 70%)' }} />

          <Container style={{ position: 'relative', zIndex: 1 }}>
            {/* section header */}
            <Row className="mb-5 align-items-end">
              <Col lg={6}>
                <div style={S.sectionLabel}>What We Offer</div>
                <h2 style={S.sectionTitle}>
                  Eight Disciplines.{' '}
                  <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    One Partner.
                  </span>
                </h2>
                <p style={S.sectionDesc}>
                  At Nerdware System Technologies, we deliver the full spectrum of digital capabilities,
                  so you never have to juggle multiple agencies again.
                </p>
              </Col>
              <Col lg={6} className="d-flex justify-content-lg-end mt-4 mt-lg-0">
                <div style={{
                  display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end',
                }}>
                  {['All', 'Build', 'Grow', 'Automate', 'AI'].map((f) => (
                    <span key={f} style={{
                      padding: '6px 18px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-light)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: f === 'All' ? '#fff' : 'var(--text-muted)',
                      background: f === 'All' ? 'rgba(255,255,255,0.08)' : 'transparent',
                      cursor: 'pointer',
                    }}>{f}</span>
                  ))}
                </div>
              </Col>
            </Row>

            {/* divider */}
            <div style={{ width: 60, height: 3, background: 'var(--primary-gradient)', borderRadius: 99, marginBottom: '3.5rem' }} />

            {/* cards — 3 + 2 + 2 layout */}
            <div ref={gridRef}>
              <Row className="g-4">
                {services.map((svc, i) => (
                  <Col key={svc.id} xs={12} sm={6} lg={i < 3 ? 4 : 6}>
                    <ServiceCard service={svc} delay={i * 80} />
                  </Col>
                ))}
              </Row>
            </div>
          </Container>
        </section>

        {/* ── AI AGENTS SPOTLIGHT ───────────────────────────────────── */}
        <section style={{ background: 'var(--bg-dark-navy)', padding: '100px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
          <Orb style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(238,79,39,0.1) 0%, transparent 65%)' }} />
          <Container style={{ position: 'relative', zIndex: 1 }}>
            <Row className="align-items-center g-5">
              <Col lg={5}>
                <div style={S.sectionLabel}>Powered by AI</div>
                <h2 style={{ ...S.sectionTitle, maxWidth: 420 }}>
                  Hire Your First{' '}
                  <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Digital Employee
                  </span>
                </h2>
                <p style={{ ...S.sectionDesc, marginBottom: '2rem' }}>
                  AI Agents don't sleep, don't get sick, and don't need onboarding time. They handle
                  customer inquiries, qualify leads, process data, manage inboxes, and execute workflows,
                  all while learning from every interaction.
                </p>
                <a href="/contact" className="svc-cta-btn" style={{ ...S.heroCta, display: 'inline-flex', transition: 'all 0.25s ease' }}>
                  Deploy an AI Agent <FaArrowRight size={14} />
                </a>
              </Col>
              <Col lg={7}>
                <div className="svc-agents-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { title: 'Customer Support Agent', desc: 'Resolves 80% of tickets autonomously. Escalates edge cases with full context.', color: '#fd8925' },
                    { title: 'Lead Qualification Bot', desc: 'Engages inbound leads, scores them, and books discovery calls automatically.', color: '#8b5cf6' },
                    { title: 'Data Processing Agent', desc: 'Ingests, cleans, and summarises reports from any source on a schedule.', color: '#10b981' },
                    { title: 'Internal Knowledge Agent', desc: 'Answers employee questions using your docs, wikis, and SOPs in real time.', color: '#3b82f6' },
                  ].map((item) => (
                    <div key={item.title} style={{
                      background: 'var(--bg-midnight)',
                      border: `1px solid ${item.color}25`,
                      borderRadius: 'var(--radius-md)',
                      padding: '1.5rem',
                      transition: 'all 0.3s ease',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${item.color}55`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = `${item.color}25`; e.currentTarget.style.transform = 'none'; }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, marginBottom: '0.75rem', boxShadow: `0 0 10px ${item.color}` }} />
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.5rem' }}>{item.title}</div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* ── PROCESS ───────────────────────────────────────────────── */}
        <section className="svc-section-pad" style={S.processSection}>
          <Container>
            <Row className="justify-content-center text-center mb-5">
              <Col lg={6}>
                <div style={S.sectionLabel}>How We Work</div>
                <h2 style={S.sectionTitle}>From Brief to Launch in 4 Steps</h2>
                <p style={{ ...S.sectionDesc, margin: '0 auto' }}>
                  A structured, transparent process that eliminates surprises and keeps you in control at every stage.
                </p>
              </Col>
            </Row>
            <div style={{ width: 60, height: 3, background: 'var(--primary-gradient)', borderRadius: 99, margin: '0 auto 3.5rem' }} />
            <Row className="justify-content-center">
              {process.map((step, i) => (
                <ProcessStep key={step.n} step={step} index={i} total={process.length} />
              ))}
            </Row>
          </Container>
        </section>

        {/* ── CTA BANNER ────────────────────────────────────────────── */}
        <section style={{ padding: '0 0 100px', background: 'var(--bg-midnight)' }}>
          <Container>
            <div style={S.ctaBanner}>
              <Orb style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(238,79,39,0.15) 0%, transparent 65%)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={S.sectionLabel}>Ready to grow?</div>
                <h2 style={{ ...S.sectionTitle, marginBottom: '1rem' }}>
                  Let's Build Something{' '}
                  <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    Extraordinary
                  </span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', marginBottom: '2.5rem', maxWidth: 520, margin: '0 auto 2.5rem' }}>
                  Whether you need a website, an automation, or a full AI agent workforce,
                  we're the team that delivers.
                </p>
                <div className="svc-btn-row" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href="/contact" className="svc-cta-btn" style={{ ...S.heroCta, padding: '0.875rem 2.5rem', fontSize: '1rem', transition: 'all 0.25s ease' }}>
                    Get a Free Consultation <FaArrowRight size={14} />
                  </a>
                  <a href="/portfolio" className="svc-outline-btn" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem 2.5rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    textDecoration: 'none',
                    background: 'transparent',
                  }}>
                    View Our Work
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
};

export default Services;