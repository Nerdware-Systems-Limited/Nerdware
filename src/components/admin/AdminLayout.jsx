import { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import { selectIsAuthenticated, selectUser } from '../../redux/slices/authslice';
import '../../styles/admin.css';

/**
 * AdminLayout
 * Wrap your /admin/* routes with this component.
 * Example (App.jsx):
 *   <Route path="/admin" element={<AdminLayout />}>
 *     <Route index element={<AdminOverview />} />
 *     <Route path="blog" element={<AdminBlogList />} />
 *     ...
 *   </Route>
 */
const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user && !['ADMIN', 'EDITOR'].includes(user.role)) {
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
    </div>
  );
};

export default AdminLayout;
