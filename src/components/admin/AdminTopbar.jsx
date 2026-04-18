import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, Menu, ExternalLink } from 'lucide-react';

const TITLES = {
  '/admin':           { crumb: 'Overview' },
  '/admin/blog':      { crumb: 'Blog' },
  '/admin/blog/new':  { crumb: 'Blog · New post' },
  '/admin/portfolio': { crumb: 'Portfolio' },
  '/admin/users':     { crumb: 'Users' },
  '/admin/messages':  { crumb: 'Messages' },
};

const AdminTopbar = ({ user, onOpenMobileMenu }) => {
  const { pathname } = useLocation();
  const matched =
    TITLES[pathname] ||
    Object.entries(TITLES)
      .filter(([k]) => k !== '/admin' && pathname.startsWith(k))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ||
    { crumb: 'Admin' };

  const avatar =
    user?.avatar ||
    'https://gravatar.com/avatar/c27ed039266d0e757973489b42b30064?s=80&d=robohash&r=x';

  return (
    <header className="nw-topbar">
      <button
        type="button"
        className="nw-icon-btn"
        onClick={onOpenMobileMenu}
        aria-label="Open menu"
        style={{ display: 'none' }}
        data-mobile-only
      >
        <Menu size={18} />
      </button>

      <div className="nw-topbar__crumbs">
        <span>Admin</span>
        <span>/</span>
        <strong>{matched.crumb}</strong>
      </div>

      <div className="nw-topbar__search">
        <Search size={16} color="rgba(255,255,255,0.5)" />
        <input placeholder="Search posts, users, projects…" />
      </div>

      <div className="nw-topbar__actions">
        <Link to="/" className="nw-icon-btn" title="View public site">
          <ExternalLink size={17} />
        </Link>
        <button type="button" className="nw-icon-btn" aria-label="Notifications">
          <Bell size={17} />
          <span className="dot" />
        </button>
        <Link to="/profile" className="nw-user">
          <img src={avatar} alt={user?.name || 'User'} />
          <span>{user?.name || 'Admin'}</span>
        </Link>
      </div>

      <style>{`
        @media (max-width: 900px) {
          [data-mobile-only] { display: grid !important; }
          .nw-topbar__search { display: none; }
        }
      `}</style>
    </header>
  );
};

export default AdminTopbar;
