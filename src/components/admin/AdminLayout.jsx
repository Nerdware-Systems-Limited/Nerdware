import { useEffect } from 'react';
import { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import {
  selectIsAuthenticated,
  selectUser,
  selectAuthStatus,
  fetchMe,
} from '../../redux/slices/authslice';
import '../../styles/admin.css';

/**
 * AdminLayout
 * Wrap your /admin/* routes with this component.
 *
 * Handles the reload case:
 *   - Token exists in localStorage → isAuthenticated is true, but user is null
 *     until fetchMe resolves. We fire fetchMe and show a spinner while waiting.
 *   - fetchMe fails (expired/invalid token) → authSlice clears token +
 *     isAuthenticated → we redirect to /login.
 */
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dispatch        = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user            = useSelector(selectUser);
  const authStatus      = useSelector(selectAuthStatus);
  const location        = useLocation();

  // On reload: token is present but user hasn't been hydrated yet → fetch it.
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchMe());
    }
  }, [isAuthenticated, user, dispatch]);

  // 1. No token at all → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Token exists but user not loaded yet → show spinner while fetchMe runs
  if (!user || authStatus === 'loading') {
    return (
      <div className="nw-admin-loading">
        <span className="nw-admin-loading__spinner" />
      </div>
    );
  }

  // 3. User loaded but wrong role → bounce to home
  if (!['ADMIN', 'EDITOR'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className={`nw-admin ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}
    >
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onCloseMobile={() => setMobileOpen(false)}
        userRole={user?.role}
      />
      <div className="nw-main">
        <AdminTopbar
          user={user}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />
        <main className="nw-content">
          <Outlet />
        </main>
      </div>

      {/* Inline styles for the loading screen — avoids a separate CSS file */}
      <style>{`
        .nw-admin-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: var(--nw-bg, #0f0f0f);
        }
        .nw-admin-loading__spinner {
          display: block;
          width: 36px;
          height: 36px;
          border: 3px solid rgba(255,255,255,0.12);
          border-top-color: rgba(255,255,255,0.7);
          border-radius: 50%;
          animation: nw-spin 0.7s linear infinite;
        }
        @keyframes nw-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;