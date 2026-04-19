import { Container, Row, Col } from 'react-bootstrap';
import { useState, useRef } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaArrowRight, FaCheck } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import SEO from '../components/common/SEO';
import { useDispatch } from 'react-redux';
import { sendContactMessage, clearContactState } from '../redux/slices/miscSlice';

/* ─── Inline style tokens (all wired to index.css variables) ─────────── */
const S = {
  page: {
    background: 'var(--bg-midnight)',
    minHeight: '100vh',
  },

  /* hero */
  hero: {
    padding: '140px 0 80px',
    background: 'var(--bg-midnight)',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(238,79,39,0.12)',
    border: '1px solid rgba(238,79,39,0.3)',
    borderRadius: 'var(--radius-full)',
    padding: '6px 18px',
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: 'var(--primary-color)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '1.5rem',
  },
  heroDot: {
    width: 7, height: 7,
    borderRadius: '50%',
    background: 'var(--primary-color)',
    display: 'inline-block',
    animation: 'pulse 2s infinite',
  },

  /* form card */
  formCard: {
    background: 'var(--bg-dark-navy)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-xl)',
    padding: '2.75rem',
  },

  /* input */
  input: {
    background: 'var(--bg-midnight)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-primary)',
    padding: '0.75rem 1rem',
    width: '100%',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'var(--font-family)',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '0.5rem',
    display: 'block',
    letterSpacing: '0.01em',
  },
  formGroup: { marginBottom: '1.25rem' },

  /* submit btn */
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    background: 'var(--primary-gradient)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '0.875rem 2.25rem',
    fontWeight: 700,
    fontSize: '0.9375rem',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    fontFamily: 'var(--font-family)',
    width: '100%',
    justifyContent: 'center',
  },

  /* alert */
  alertSuccess: {
    background: 'rgba(16,185,129,0.12)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: 'var(--radius-md)',
    color: '#6ee7b7',
    padding: '1rem 1.25rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '0.9rem',
  },
  alertError: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 'var(--radius-md)',
    color: '#fca5a5',
    padding: '1rem 1.25rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: '0.9rem',
  },

  /* info card */
  infoCard: {
    background: 'var(--bg-dark-navy)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    transition: 'all 0.3s ease',
  },
  iconCircle: {
    width: 44, height: 44,
    borderRadius: 'var(--radius-md)',
    background: 'rgba(238,79,39,0.12)',
    border: '1px solid rgba(238,79,39,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--primary-color)',
  },

  /* service pills */
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-full)',
    padding: '5px 14px',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
    margin: '4px',
  },
};

/* ─── Orb helper ─────────────────────────────────────────────────────── */
const Orb = ({ style }) => (
  <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0, ...style }} />
);

/* ─── Controlled input with focus glow ──────────────────────────────── */
function FancyInput({ as = 'input', label, required, ...props }) {
  const [focused, setFocused] = useState(false);
  const style = {
    ...S.input,
    borderColor: focused ? 'var(--primary-color)' : 'var(--border-light)',
    boxShadow: focused ? '0 0 0 3px rgba(238,79,39,0.15)' : 'none',
    resize: as === 'textarea' ? 'vertical' : undefined,
    minHeight: as === 'textarea' ? 140 : undefined,
  };
  return (
    <div style={S.formGroup}>
      {label && <label style={S.label}>{label}{required && <span style={{ color: 'var(--primary-color)', marginLeft: 3 }}>*</span>}</label>}
      {as === 'textarea'
        ? <textarea style={style} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} {...props} />
        : <input style={style} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} {...props} />
      }
    </div>
  );
}

/* ─── Contact info row ───────────────────────────────────────────────── */
function InfoCard({ icon, title, lines }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ ...S.infoCard, borderColor: hov ? 'rgba(238,79,39,0.25)' : 'var(--border-subtle)', transform: hov ? 'translateX(4px)' : 'none' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={S.iconCircle}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '0.35rem' }}>{title}</div>
        {lines.map((l, i) => (
          <div key={i} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.65 }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
const Contact = () => {
  const form = useRef();
  const dispatch = useDispatch();
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const services = ['Web Development', 'Mobile App', 'SEO', 'Data Analysis', 'Automation', 'AI Agent', 'Other'];
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setShowError(false);

    const data = new FormData(form.current);
    const messageData = {
      name:    data.get('name'),
      email:   data.get('email'),
      phone:   data.get('phone'),
      company: data.get('company'),
      subject: data.get('subject'),
      message: data.get('message'),
      budget:  data.get('budget'),
      service: selectedService,
    };

    try {
      // 1️⃣  EmailJS — keeps your email notification
      // await emailjs.sendForm(
      //   'service_robfegs', 'template_ee07y1j', form.current,
      //   { publicKey: 'msPpvIVCXTIzEVGOD' }
      // );

      // 2️⃣  POST /api/contact via Redux
      await dispatch(sendContactMessage(messageData)).unwrap();

      window.scrollTo({
        top: 20,
        behavior: 'smooth',
      });

      setSubmitting(false);
      setShowSuccess(true);
      form.current.reset();
      setSelectedService('');
      dispatch(clearContactState());
      setTimeout(() => setShowSuccess(false), 5000);

    } catch (error) {
      console.log('FAILED...', error);
      setSubmitting(false);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  return (
    <>
      <SEO
        title="Contact Us — Nerdware System Technologies"
        description="Get in touch with Nerdware Technologies for web development, mobile apps, AI agents, and automation. We're here to help you succeed."
        keywords="contact, web development, mobile apps, AI agents, automation, Nerdware Technologies"
        url="/contact"
      />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.5)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .contact-submit:hover { opacity:.88 !important; transform:translateY(-2px) !important; box-shadow:0 12px 32px rgba(238,79,39,0.4) !important; }
        .contact-submit:disabled { opacity:.55 !important; cursor:not-allowed !important; transform:none !important; }
        .svc-pill-active { background:rgba(238,79,39,0.15) !important; border-color:rgba(238,79,39,0.4) !important; color:var(--primary-color) !important; }
        .svc-pill { cursor:pointer; transition:all 0.2s ease; }
        .svc-pill:hover { border-color:var(--border-medium) !important; color:var(--text-secondary) !important; }
      `}</style>

      <main style={S.page}>

        {/* ── HERO ────────────────────────────────────────────────── */}
        <section style={S.hero}>
          <Orb style={{ top: '-15%', right: '-5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(238,79,39,0.11) 0%, transparent 70%)' }} />
          <Orb style={{ bottom: '0', left: '-8%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(107,33,239,0.08) 0%, transparent 70%)' }} />
          <Container style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ animation: 'fadeInUp 0.6s ease both' }}>
              <div style={S.heroBadge}><span style={S.heroDot} />Let's Talk</div>
            </div>
            <h1 style={{
              fontSize: 'clamp(3rem,6vw,5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.05,
              marginBottom: '1.25rem',
              animation: 'fadeInUp 0.6s ease 0.1s both',
            }}>
              Start Your{' '}
              <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Next Project
              </span>
            </h1>
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '1.125rem',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.75,
              animation: 'fadeInUp 0.6s ease 0.2s both',
            }}>
              Have a project in mind? Whether it's a website, mobile app, automation, or an AI agent —
              we'd love to hear from you. Response guaranteed within 24 hours.
            </p>

            {/* trust bar */}
            <div style={{
              display: 'flex',
              gap: 24,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '2.5rem',
              animation: 'fadeInUp 0.6s ease 0.3s both',
            }}>
              {['24hr Response Time', 'Free Consultation', 'No Commitment Required'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  <FaCheck size={11} style={{ color: 'var(--primary-color)' }} />{t}
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── MAIN CONTENT ────────────────────────────────────────── */}
        <section style={{ padding: '20px 0 100px', background: 'var(--bg-midnight)' }}>
          <Container>
            <Row className="g-4 g-xl-5">

              {/* ── LEFT — FORM ─────────────────────────────────── */}
              <Col lg={7}>
                <div style={{ ...S.formCard, animation: 'fadeInUp 0.6s ease 0.1s both' }}>
                  {/* header */}
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ width: 40, height: 3, background: 'var(--primary-gradient)', borderRadius: 99, marginBottom: '1rem' }} />
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '0.35rem' }}>
                      Send Us a Message
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', margin: 0 }}>Fill in the details below and we'll get back to you shortly.</p>
                  </div>

                  {/* alerts */}
                  {showSuccess && (
                    <div style={S.alertSuccess}>
                      <FaCheck size={14} />
                      Message sent! We'll respond within 24 hours.
                    </div>
                  )}
                  {showError && (
                    <div style={S.alertError}>
                      ✕ Failed to send. Please try again or email us directly.
                    </div>
                  )}

                  <form ref={form} onSubmit={handleSubmit}>
                    {/* service selector */}
                    <div style={S.formGroup}>
                      <label style={S.label}>I'm interested in<span style={{ color: 'var(--primary-color)', marginLeft: 3 }}>*</span></label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                        {services.map((s) => (
                          <span
                            key={s}
                            className={`svc-pill ${selectedService === s ? 'svc-pill-active' : ''}`}
                            style={S.pill}
                            onClick={() => setSelectedService(s)}
                          >
                            {selectedService === s && <FaCheck size={10} />}
                            {s}
                          </span>
                        ))}
                      </div>
                      <input type="hidden" name="service" value={selectedService} />
                    </div>

                    <Row>
                      <Col md={6}>
                        <FancyInput label="Full Name" type="text" name="name" required placeholder="Your full name" />
                      </Col>
                      <Col md={6}>
                        <FancyInput label="Email Address" type="email" name="email" required placeholder="your@email.com" />
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <FancyInput label="Phone Number" type="tel" name="phone" placeholder="+254 7XX XXX XXX" />
                      </Col>
                      <Col md={6}>
                        <FancyInput label="Company / Organisation" type="text" name="company" placeholder="Optional" />
                      </Col>
                    </Row>

                    <FancyInput label="Subject" type="text" name="subject" required placeholder="e.g. Build an e-commerce website" />

                    <FancyInput
                      as="textarea"
                      label="Project Details"
                      name="message"
                      required
                      placeholder="Tell us about your project, goals, timeline, and budget..."
                    />

                    {/* budget select */}
                    <div style={S.formGroup}>
                      <label style={S.label}>Budget Range</label>
                      <div style={{ position: 'relative' }}>
                        <select
                          name="budget"
                          style={{
                            ...S.input,
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            paddingRight: '2.5rem',
                            cursor: 'pointer',
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Select a range</option>
                          <option>Under KES 50,000</option>
                          <option>KES 50,000 – 150,000</option>
                          <option>KES 150,000 – 500,000</option>
                          <option>KES 500,000+</option>
                          <option>Let's discuss</option>
                        </select>
                        <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '0.75rem' }}>▼</span>
                      </div>
                    </div>

                    <button type="submit" className="contact-submit" disabled={submitting} style={{ ...S.submitBtn, transition: 'all 0.25s ease' }}>
                      {submitting ? (
                        <>
                          <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                          Sending…
                        </>
                      ) : (
                        <>Send Message <FaArrowRight size={13} /></>
                      )}
                    </button>
                  </form>
                </div>
              </Col>

              {/* ── RIGHT — INFO ────────────────────────────────── */}
              <Col lg={5}>
                <div style={{ animation: 'fadeInUp 0.6s ease 0.2s both' }}>

                  {/* heading */}
                  <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{ width: 40, height: 3, background: 'var(--primary-gradient)', borderRadius: 99, marginBottom: '1rem' }} />
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '0.35rem' }}>
                      Find Us
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Multiple ways to reach the Nerdware team.</p>
                  </div>

                  <InfoCard
                    icon={<FaMapMarkerAlt size={18} />}
                    title="Our Address"
                    lines={['Isaac Salat Road, Innovation District', 'Kericho, Kenya']}
                  />
                  <InfoCard
                    icon={<FaPhone size={17} />}
                    title="Call Us"
                    lines={['+254 707 263 447', '+254 723 753 014']}
                  />
                  <InfoCard
                    icon={<FaEnvelope size={17} />}
                    title="Email Us"
                    lines={['info@nerdwaretechnologies.com', 'support@nerdwaretechnologies.com']}
                  />
                  <InfoCard
                    icon={<FaClock size={17} />}
                    title="Working Hours"
                    lines={['Mon – Fri: 9:00 AM – 6:00 PM', 'Saturday: 10:00 AM – 4:00 PM']}
                  />

                  {/* response promise card */}
                  <div style={{
                    marginTop: '1.25rem',
                    background: 'linear-gradient(135deg, rgba(238,79,39,0.14) 0%, rgba(107,33,239,0.08) 100%)',
                    border: '1px solid rgba(238,79,39,0.2)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Our Promise</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
                      Every inquiry gets a personal response — not a bot. We'll reply within <strong style={{ color: 'var(--text-secondary)' }}>24 hours</strong> and schedule a free consultation to scope your project together.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
};

export default Contact;