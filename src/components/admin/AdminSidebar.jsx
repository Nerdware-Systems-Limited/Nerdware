import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, Briefcase, MessageSquare,
  Settings, ChevronsLeft, ChevronsRight, LogOut,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authslice';

const NAV = [
  { section: 'Workspace', items: [
    { to: '/admin',           label: 'Overview',   icon: LayoutDashboard, end: true },
    { to: '/admin/blog',      label: 'Blog',       icon: FileText },
    { to: '/admin/portfolio', label: 'Portfolio',  icon: Briefcase },
  ]},
  { section: 'Management', adminOnly: true, items: [
    { to: '/admin/users',     label: 'Users',      icon: Users, adminOnly: true },
    { to: '/admin/messages',  label: 'Messages',   icon: MessageSquare, adminOnly: true },
    { to: '/admin/applications', label: 'Applications', icon: Briefcase, adminOnly: true},
    { to: '/admin/newsletter', label: 'Newsletter',  icon: Briefcase, adminOnly: true}
  ]},
  { section: 'Account', items: [
    { to: '/profile',         label: 'Settings',   icon: Settings },
  ]},
];

const AdminSidebar = ({ collapsed, onToggleCollapse, onCloseMobile, userRole }) => {
  const dispatch = useDispatch();
  const isAdmin = userRole === 'ADMIN';

  return (
    <aside className="nw-sidebar">
      <Link to="/" className="nw-brand" onClick={onCloseMobile}>
        <span className="dot" />
        <span>Nerdware</span>
      </Link>

      <nav className="nw-nav">
        {NAV.map((group) => {
          if (group.adminOnly && !isAdmin) return null;
          const visibleItems = group.items.filter((i) => !i.adminOnly || isAdmin);
          if (!visibleItems.length) return null;
          return (
            <div key={group.section}>
              {!collapsed && <div className="nw-nav__label">{group.section}</div>}
              {visibleItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `nw-nav__item ${isActive ? 'is-active' : ''}`
                  }
                  title={collapsed ? label : undefined}
                >
                  <Icon className="nw-nav__icon" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <button
        type="button"
        className="nw-nav__item"
        onClick={() => dispatch(logout())}
        style={{ width: '100%', background: 'transparent', border: 0, cursor: 'pointer' }}
      >
        <LogOut className="nw-nav__icon" />
        <span>Sign out</span>
      </button>

      <button
        type="button"
        className="nw-collapse-btn"
        onClick={onToggleCollapse}
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        <span>Collapse</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
