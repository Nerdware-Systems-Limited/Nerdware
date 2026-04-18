import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearAuthError, selectAuthStatus, selectAuthError, selectIsAuthenticated } from '../redux/slices/authslice';

export default function Register() {
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const status          = useSelector(selectAuthStatus);
  const error           = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [form, setForm]             = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm,  setShowConfirm]         = useState(false);
  const [localError,   setLocalError]          = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) dispatch(clearAuthError());
    if (localError) setLocalError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    const { confirmPassword, ...payload } = form;
    dispatch(registerUser(payload));
  };

  const isLoading    = status === 'loading';
  const displayError = localError || error;

  /* Minimal strength indicator */
  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6)  s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9!@#$%^&*]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'][strength];

  return (
    <div className="auth-page">
      <div className="auth-glow" aria-hidden="true" />

      <div className="auth-card fade-in-up">
        <div className="auth-brand">
          <span className="text-gradient">Nerdware</span>
        </div>

        <h2 className="auth-heading">Create your account</h2>
        <p className="auth-subheading">Join us and start building something great</p>

        {displayError && (
          <div className="auth-alert" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Name */}
          <div className="auth-field">
            <label htmlFor="name" className="form-label">Full name</label>
            <input
              id="name"
              type="text"
              name="name"
              className="form-control"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="auth-field">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-control"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div className="auth-strength">
                <div className="auth-strength-bar">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="auth-strength-segment"
                      style={{ background: i <= strength ? strengthColor : undefined }}
                    />
                  ))}
                </div>
                <span className="auth-strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="auth-field">
            <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
            <div className="auth-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                className="form-control"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="auth-spinner" aria-hidden="true" />
                Creating account…
              </>
            ) : 'Create account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}