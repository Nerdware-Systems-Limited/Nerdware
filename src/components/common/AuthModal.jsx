import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  loginUser,
  registerUser,
  clearAuthError,
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
} from '../../redux/slices/authslice';
import { useAuthModal } from '../../context/AuthModalContext';
import SocialAuthButtons from './SocialAuthButtons';

const EyeIcon = ({ open }) => (
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
);

export default function AuthModal() {
  const { isOpen, mode, error: routeError, switchMode, close, clearError } = useAuthModal();
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const reduxError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState('');

  const isLoading = status === 'loading';
  const displayError = localError || reduxError || routeError;

  // Close automatically once sign-in / sign-up succeeds.
  useEffect(() => {
    if (isAuthenticated && isOpen) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Reset local form state whenever the modal opens or the mode changes.
  useEffect(() => {
    if (isOpen) {
      setLoginForm({ email: '', password: '' });
      setRegisterForm({ name: '', email: '', password: '', confirmPassword: '' });
      setShowPassword(false);
      setShowConfirm(false);
      setLocalError('');
      dispatch(clearAuthError());
    }
  }, [isOpen, mode, dispatch]);

  // Lock body scroll while open + close on Escape.
  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, close]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleLoginChange = (e) => {
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (reduxError) dispatch(clearAuthError());
    if (routeError) clearError();
  };

  const handleRegisterChange = (e) => {
    setRegisterForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (reduxError) dispatch(clearAuthError());
    if (routeError) clearError();
    if (localError) setLocalError('');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(loginForm));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    const { confirmPassword, ...payload } = registerForm;
    dispatch(registerUser(payload));
  };

  const strength = (() => {
    const p = registerForm.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9!@#$%^&*]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e', '#16a34a'][strength];

  const modal = (
    <div
      className="auth-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      role="presentation"
    >
      <div
        className="auth-modal-panel fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? 'Sign in' : 'Create your account'}
      >
        <button type="button" className="auth-modal-close" onClick={close} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="auth-brand">
          <span className="text-gradient">Nerdware</span>
        </div>

        <div className="auth-modal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-modal-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-modal-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            Create account
          </button>
        </div>

        {displayError && (
          <div className="auth-alert" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {displayError}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="modal-email" className="form-label">Email address</label>
              <input
                id="modal-email"
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div className="auth-label-row">
                <label htmlFor="modal-password" className="form-label">Password</label>
                <Link to="/forgot-password" className="auth-link auth-link--small" onClick={close}>
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input-wrapper">
                <input
                  id="modal-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
              {isLoading ? (<><span className="auth-spinner" aria-hidden="true" />Signing in…</>) : 'Sign in'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="modal-name" className="form-label">Full name</label>
              <input
                id="modal-name"
                type="text"
                name="name"
                className="form-control"
                placeholder="Jane Doe"
                value={registerForm.name}
                onChange={handleRegisterChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="modal-reg-email" className="form-label">Email address</label>
              <input
                id="modal-reg-email"
                type="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={registerForm.email}
                onChange={handleRegisterChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="modal-reg-password" className="form-label">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="modal-reg-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder="Min. 6 characters"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {registerForm.password && (
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

            <div className="auth-field">
              <label htmlFor="modal-confirm-password" className="form-label">Confirm password</label>
              <div className="auth-input-wrapper">
                <input
                  id="modal-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Re-enter password"
                  value={registerForm.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
              {isLoading ? (<><span className="auth-spinner" aria-hidden="true" />Creating account…</>) : 'Create account'}
            </button>
          </form>
        )}

        <SocialAuthButtons />

        <p className="auth-footer-text">
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button type="button" className="auth-link auth-link--button" onClick={() => switchMode('register')}>
                Create one
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button type="button" className="auth-link auth-link--button" onClick={() => switchMode('login')}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
