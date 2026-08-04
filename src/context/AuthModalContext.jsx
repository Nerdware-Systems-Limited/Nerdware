import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthModalContext = createContext(null);

const OAUTH_ERROR_MESSAGE = 'Something went wrong signing in with that provider. Please try again.';

export function AuthModalProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [error, setError] = useState(null);

  const openLogin = useCallback(() => {
    setMode('login');
    setError(null);
    setIsOpen(true);
  }, []);

  const openRegister = useCallback(() => {
    setMode('register');
    setError(null);
    setIsOpen(true);
  }, []);

  const switchMode = useCallback((nextMode) => {
    setMode(nextMode);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Closing always clears the modal; if it was reached via a direct /login or
  // /register navigation (deep link, redirect, back/forward), also clean up the URL.
  const close = useCallback(() => {
    setIsOpen(false);
    setError(null);
    if (location.pathname === '/login' || location.pathname === '/register') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Deep links / redirects (Comments prompt, admin auth guard, OAuth callback) land on
  // /login or /register directly — open the modal over whatever the route renders.
  useEffect(() => {
    if (location.pathname === '/login') {
      const params = new URLSearchParams(location.search);
      setError(params.get('error') === 'oauth_failed' ? OAUTH_ERROR_MESSAGE : null);
      setMode('login');
      setIsOpen(true);
    } else if (location.pathname === '/register') {
      setError(null);
      setMode('register');
      setIsOpen(true);
    }
  }, [location.pathname, location.search]);

  return (
    <AuthModalContext.Provider
      value={{ isOpen, mode, error, openLogin, openRegister, switchMode, close, clearError }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within an AuthModalProvider');
  return ctx;
}
