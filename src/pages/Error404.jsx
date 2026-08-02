import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaCode } from 'react-icons/fa';
import SEO from '../components/common/SEO';

/* ─── Glitchy animated 404 ──────────────────────────────────────────── */
const GlitchNumber = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ position: 'relative', display: 'inline-block', lineHeight: 1 }}>
      <style>{`
        @keyframes glitch1 {
          0%,94%,100%{ clip-path:none; transform:none; opacity:1; }
          95%{ clip-path:polygon(0 20%,100% 20%,100% 35%,0 35%); transform:translateX(-4px); opacity:.85; }
          96%{ clip-path:polygon(0 60%,100% 60%,100% 75%,0 75%); transform:translateX(4px); opacity:.85; }
          97%{ clip-path:polygon(0 40%,100% 40%,100% 55%,0 55%); transform:translateX(-2px); }
          98%{ transform:none; clip-path:none; }
        }
        @keyframes glitch2 {
          0%,93%,100%{ opacity:0; }
          95%{ opacity:.5; transform:translateX(6px); clip-path:polygon(0 15%,100% 15%,100% 30%,0 30%); }
          96%{ opacity:.4; transform:translateX(-6px); clip-path:polygon(0 65%,100% 65%,100% 80%,0 80%); }
          97%{ opacity:.3; transform:translateX(3px); clip-path:polygon(0 45%,100% 45%,100% 55%,0 55%); }
          98%{ opacity:0; }
        }
        @keyframes scanline {
          0%{ transform:translateY(-100%); }
          100%{ transform:translateY(400%); }
        }
        @keyframes float404 {
          0%,100%{ transform:translateY(0); }
          50%{ transform:translateY(-12px); }
        }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.5)} }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(180deg) translateX(180px) rotate(-180deg); }
          to   { transform: rotate(540deg) translateX(180px) rotate(-540deg); }
        }
        .err-home-btn:hover { opacity:.88 !important; transform:translateY(-2px) !important; box-shadow:0 12px 32px rgba(238,79,39,0.4) !important; }
        .err-back-btn:hover { background:rgba(255,255,255,0.08) !important; color:#fff !important; }
        .err-nav-card:hover { border-color:rgba(238,79,39,0.3) !important; transform:translateY(-4px) !important; }
      `}</style>

      {/* main number */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 'clamp(7rem,18vw,14rem)',
        color: 'transparent',
        WebkitTextStroke: '2px rgba(238,79,39,0.5)',
        letterSpacing: '-0.05em',
        animation: 'glitch1 3.2s infinite, float404 5s ease-in-out infinite',
        userSelect: 'none',
        position: 'relative',
        zIndex: 2,
      }}>
        404
      </div>

      {/* glitch layer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: 'clamp(7rem,18vw,14rem)',
        color: 'var(--primary-color)',
        letterSpacing: '-0.05em',
        opacity: 0,
        animation: 'glitch2 3.2s infinite',
        userSelect: 'none',
        zIndex: 1,
      }}>
        404
      </div>

      {/* scanline */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 3,
      }}>
        <div style={{
          width: '100%',
          height: '30%',
          background: 'linear-gradient(to bottom, transparent, rgba(238,79,39,0.08), transparent)',
          animation: 'scanline 2.5s linear infinite',
        }} />
      </div>
    </div>
  );
};

/* ─── Floating particles ─────────────────────────────────────────────── */
const Particles = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    {[
      { size: 6, top: '20%', left: '10%', delay: '0s', dur: '6s' },
      { size: 4, top: '70%', left: '85%', delay: '1s', dur: '8s' },
      { size: 8, top: '40%', left: '92%', delay: '0.5s', dur: '7s' },
      { size: 3, top: '80%', left: '15%', delay: '2s', dur: '9s' },
      { size: 5, top: '15%', left: '75%', delay: '1.5s', dur: '6.5s' },
    ].map((p, i) => (
      <div key={i} style={{
        position: 'absolute',
        top: p.top, left: p.left,
        width: p.size, height: p.size,
        borderRadius: '50%',
        background: 'var(--primary-color)',
        opacity: 0.25,
        animation: `float404 ${p.dur} ease-in-out ${p.delay} infinite`,
      }} />
    ))}
  </div>
);

/* ─── Nav link card ──────────────────────────────────────────────────── */
function NavCard({ to, emoji, title, desc }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="err-nav-card" style={{
        background: 'var(--bg-dark-navy)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1rem',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        height: '100%',
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{emoji}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{title}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{desc}</div>
      </div>
    </Link>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
const Error404 = () => {
  return (
    <>
      <SEO
        title="404: Page Not Found | Nerdware System Technologies"
        description="The page you're looking for doesn't exist. Return to Nerdware Technologies homepage or explore our services."
        keywords="404, page not found, error, Nerdware Technologies"
        url="/404"
      />

      <main style={{ background: 'var(--bg-midnight)', minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* ambient orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(238,79,39,0.08) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,33,239,0.07) 0%, transparent 65%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Particles />

        {/* grid overlay texture */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        <Container style={{ position: 'relative', zIndex: 1, padding: '120px 0 80px' }}>
          <Row className="justify-content-center text-center">
            <Col lg={8} xl={6}>

              {/* top badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(238,79,39,0.1)', border: '1px solid rgba(238,79,39,0.25)',
                borderRadius: 'var(--radius-full)', padding: '5px 16px',
                fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-color)',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem',
                animation: 'fadeInUp 0.5s ease both',
              }}>
                <FaCode size={11} /> Error 404
              </div>

              {/* glitch 404 */}
              <div style={{ animation: 'fadeInUp 0.6s ease 0.05s both' }}>
                <GlitchNumber />
              </div>

              {/* message */}
              <div style={{ animation: 'fadeInUp 0.6s ease 0.15s both', marginTop: '0.5rem' }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'clamp(1.5rem,3vw,2rem)',
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  marginBottom: '1rem',
                }}>
                  You've Wandered Into{' '}
                  <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    the Void
                  </span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.0625rem', lineHeight: 1.75, maxWidth: 460, margin: '0 auto 2.5rem' }}>
                  This page either moved, was deleted, or never existed. Even the best developers take a wrong turn sometimes.
                </p>
              </div>

              {/* action buttons */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeInUp 0.6s ease 0.25s both', marginBottom: '3.5rem' }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                  <button className="err-home-btn" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 9,
                    background: 'var(--primary-gradient)',
                    color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                    padding: '0.8125rem 2rem', fontWeight: 700, fontSize: '0.9375rem',
                    cursor: 'pointer', transition: 'all 0.25s ease', fontFamily: 'var(--font-family)',
                  }}>
                    <FaHome size={14} /> Back to Home
                  </button>
                </Link>
                <button
                  className="err-back-btn"
                  onClick={() => window.history.back()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 9,
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.8125rem 2rem', fontWeight: 600, fontSize: '0.9375rem',
                    cursor: 'pointer', transition: 'all 0.25s ease',
                    background: 'transparent', fontFamily: 'var(--font-family)',
                  }}>
                  <FaArrowLeft size={13} /> Go Back
                </button>
              </div>

              {/* divider */}
              <div style={{ width: 48, height: 2, background: 'var(--primary-gradient)', borderRadius: 99, margin: '0 auto 2.5rem', animation: 'fadeInUp 0.6s ease 0.3s both' }} />

              {/* helpful nav cards */}
              <div style={{ animation: 'fadeInUp 0.6s ease 0.35s both' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                  Where would you like to go?
                </p>
                <Row className="g-3">
                  <Col xs={6} md={3}><NavCard to="/" emoji="🏠" title="Home" desc="Start fresh" /></Col>
                  <Col xs={6} md={3}><NavCard to="/services" emoji="⚡" title="Services" desc="What we do" /></Col>
                  <Col xs={6} md={3}><NavCard to="/portfolio" emoji="🎨" title="Portfolio" desc="Our work" /></Col>
                  <Col xs={6} md={3}><NavCard to="/contact" emoji="💬" title="Contact" desc="Get in touch" /></Col>
                </Row>
              </div>

              {/* tech quote */}
              <div style={{
                marginTop: '3rem',
                padding: '1.25rem 1.5rem',
                background: 'var(--bg-dark-navy)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                animation: 'fadeInUp 0.6s ease 0.45s both',
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic', margin: '0 0 0.5rem', lineHeight: 1.6 }}>
                  "There are only 10 types of people in the world: those who understand binary and those who don't."
                </p>
                <span style={{ fontSize: '0.75rem', color: 'rgba(238,79,39,0.7)', fontWeight: 600, letterSpacing: '0.04em' }}>Classic Programming Joke</span>
              </div>

            </Col>
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Error404;