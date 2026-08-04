import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectUser,
  selectAuthStatus,
  fetchMe,
  logout,
} from '../../redux/slices/authslice';
import { useAuthModal } from '../../context/AuthModalContext';

const Header = () => {
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const authStatus = useSelector(selectAuthStatus);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { openLogin, openRegister } = useAuthModal();

  // On page load: token exists in localStorage but Redux user is null → hydrate.
  // This mirrors what AdminLayout does and keeps the Header in sync after a hard
  // refresh, without waiting for the user to navigate somewhere that calls fetchMe.
  // If the token is expired/invalid, fetchMe will fail → authSlice clears
  // isAuthenticated → Header correctly shows Sign in / Get Started.
  useEffect(() => {
    if (isAuthenticated && !user && authStatus !== 'loading') {
      dispatch(fetchMe());
    }
  }, [isAuthenticated, user, authStatus, dispatch]);
  
  const avatarUrl = user?.avatar || "https://gravatar.com/avatar/c27ed039266d0e757973489b42b30064?s=400&d=robohash&r=x";
  const isAdmin = ['ADMIN', 'EDITOR'].includes(user?.role);

  // Collapse navbar on route change
  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);


  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      setScrolled(currentY > 40);
      setVisible(currentY < lastScrollY.current || currentY < 10);

      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      expanded={expanded}
      onToggle={() => setExpanded(!expanded)}
      className={`fixed-top ${scrolled ? 'navbar-scrolled' : ''}`}
      style={{ background: 'transparent', padding: '0.5rem 0', transform: visible ? 'translateY(0)' : 'translateY(-110%)', transition: 'transform 0.35s ease', }}
    >
      <Container>
        {/* Glassmorphism pill wrapper */}
        <div
          className="navbar-wrapper d-flex align-items-center justify-content-between w-100"
          style={{
            background: scrolled
              ? 'rgba(14, 9, 24, 0.92)'
              : 'rgba(14, 9, 24, 0.70)',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            borderRadius: '16px',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            padding: '0 1rem',
            transition: 'background 0.3s ease, box-shadow 0.3s ease',
            boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.35)' : 'none',
          }}
        >
          {/* Brand */}
          <Navbar.Brand
            as={Link}
            to="/"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: '1.05rem',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              letterSpacing: '-0.02em',
              padding: '0.75rem 0',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <img
              src="/images/logo.png"
              alt="Nerdware Systems"
              height="36"
              style={{ display: 'inline-block' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span style={{ color: '#ffffff' }}>Nerdware Systems</span>
          </Navbar.Brand>

          {/* Desktop Nav */}
          <Nav
            className="d-none d-lg-flex align-items-center"
            style={{ gap: '0.125rem' }}
          >
            {[
              { to: '/', label: 'Home' },
              { to: '/about', label: 'About Us' },
              { to: '/services', label: 'Services' },
              { to: '/portfolio', label: 'Portfolio' },
              { to: '/blog', label: 'Blog' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label }) => (
              <Nav.Link
                key={to}
                as={NavLink}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '8px',
                  transition: 'color 0.2s ease, background-color 0.2s ease',
                  background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  const isActive = e.currentTarget.classList.contains('active');
                  e.currentTarget.style.color = isActive ? '#ffffff' : 'rgba(255,255,255,0.65)';
                  e.currentTarget.style.background = isActive ? 'rgba(255,255,255,0.07)' : 'transparent';
                }}
              >
                {label}
              </Nav.Link>
            ))}
          </Nav>

          {/* Desktop CTA */}
          <div className="d-none d-lg-flex align-items-center" style={{ gap: '0.625rem', flexShrink: 0 }}>
            {!isAuthenticated ? (
            <>
            <button
              type="button"
              onClick={openLogin}
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.75)',
                padding: '0.5rem 0.875rem',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={openRegister}
              className="btn-get-started"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                background: 'linear-gradient(90deg, #fd8925 0%, #ee4f27 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1.125rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.88';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Get Started
              <svg width="14" height="14" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="m221.66 133.66-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32"/>
              </svg>
            </button>
            </>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle
                  as="button"
                  bsPrefix="nw-profile-toggle"
                  id="profile-dropdown-desktop"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    padding: '0.375rem 0.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={avatarUrl}
                    alt={user?.name || "User"}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #fff',
                    }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/40?text=👤";
                    }}
                  />

                  <span
                    style={{
                      color: '#fff',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    {user?.name}
                  </span>

                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </Dropdown.Toggle>

                <Dropdown.Menu className="nw-profile-menu">
                  <Dropdown.Item as={Link} to="/profile">
                    Profile
                  </Dropdown.Item>
                  {isAdmin && (
                    <Dropdown.Item as={Link} to="/admin">
                      Admin
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => dispatch(logout())}>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
                )}
          </div>

          {/* Mobile Toggler */}
          <Navbar.Toggle
            aria-controls="mobile-navbar-nav"
            onClick={() => setExpanded(!expanded)}
            className="d-lg-none"
            style={{
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              background: 'rgba(255,255,255,0.05)',
            }}
          >
            <span style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              width: '20px',
            }}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    height: '2px',
                    background: '#ffffff',
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                    transformOrigin: 'center',
                    transform: expanded
                      ? i === 1 ? 'scaleX(0)' : i === 0 ? 'rotate(45deg) translate(4px, 4px)' : 'rotate(-45deg) translate(4px, -4px)'
                      : 'none',
                    opacity: expanded && i === 1 ? 0 : 1,
                  }}
                />
              ))}
            </span>
          </Navbar.Toggle>
        </div>

        {/* Mobile Menu */}
        <Navbar.Collapse
          id="mobile-navbar-nav"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: '0',
            right: '0',
            zIndex: 1000,
          }}
        >
          <div
            className="d-lg-none"
            style={{
              background: 'rgba(27, 23, 40, 0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              padding: '0.75rem',
              margin: '0',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            }}
          >
            <Nav className="flex-column" style={{ gap: '0.25rem' }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Us' },
                { to: '/services', label: 'Services' },
                { to: '/portfolio', label: 'Portfolio' },
                { to: '/blog', label: 'Blog' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <Nav.Link
                  key={to}
                  as={NavLink}
                  to={to}
                  end={to === '/'}
                  onClick={() => setExpanded(false)}
                  style={({ isActive }) => ({
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '8px',
                    background: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                    transition: 'color 0.2s ease, background 0.2s ease',
                    textDecoration: 'none',
                  })}
                >
                  {label}
                </Nav.Link>
              ))}
            </Nav>

            {/* Mobile CTAs */}
            <div
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {!isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setExpanded(false); openLogin(); }}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '0.625rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.80)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Sign in
                  </button>

                  <button
                    type="button"
                    onClick={() => { setExpanded(false); openRegister(); }}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '0.375rem',
                      padding: '0.625rem 1rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(90deg, #fd8925 0%, #ee4f27 100%)',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  {/* Profile info (not a link — use the actions below) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <img
                      src={avatarUrl}
                      alt={user?.name || "User"}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/40?text=👤";
                      }}
                    />

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#fff', fontWeight: 600 }}>
                        {user?.name}
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                        {user?.email}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Link
                    to="/profile"
                    onClick={() => setExpanded(false)}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '0.625rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.80)',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                    }}
                  >
                    Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setExpanded(false)}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '0.625rem 1rem',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.80)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        textDecoration: 'none',
                      }}
                    >
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      dispatch(logout());
                      setExpanded(false);
                    }}
                    style={{
                      padding: '0.625rem 1rem',
                      borderRadius: '8px',
                      background: 'rgba(255,0,0,0.1)',
                      border: '1px solid rgba(255,0,0,0.2)',
                      color: '#ff6b6b',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;