import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

/* ── auth ── */
import {
  fetchMe, updateMe, changePassword, logout,
  clearUpdateState, clearPasswordState,
  selectUser, selectAuthStatus,
  selectUpdateStatus, selectUpdateError,
  selectPasswordStatus, selectPasswordError,
} from '../redux/slices/authslice';

/* ── data slices for live stats ── */
import { fetchBlogs,       selectAllBlogs,       selectBlogsStatus,  selectBlogsPagination } from '../redux/slices/Blogslice';
import { fetchAllPortfolios, selectAllPortfolios, selectPortfoliosStatus } from '../redux/slices/portfolioSlice';
import { fetchAllApplications, selectAllApplications, selectApplicationsStatus } from '../redux/slices/applicationsSlice';
import { fetchMessages,    selectMessages,        selectMessagesStatus } from '../redux/slices/miscSlice';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Tiny helpers                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const ROLE_META = {
  ADMIN:  { label: 'Admin',  color: '#38bdf8', glow: 'rgba(56,189,248,0.35)',  symbol: '◈' },
  EDITOR: { label: 'Editor', color: '#818cf8', glow: 'rgba(129,140,248,0.35)', symbol: '◇' },
  WRITER: { label: 'Writer', color: '#34d399', glow: 'rgba(52,211,153,0.35)',  symbol: '◉' },
  USER:   { label: 'User',   color: '#64748b', glow: 'rgba(100,116,139,0.25)', symbol: '○' },
};

const BLOG_STATUS_COLOR = { PUBLISHED: '#4ade80', DRAFT: '#fbbf24', ARCHIVED: '#94a3b8' };

const formatBlogDate = (s) =>
  s ? new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

/* ─── SVG icon helpers ── */
const Icon = ({ d, size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

const EyeIcon = ({ visible }) => visible ? (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const Spinner = ({ size = 15 }) => (
  <span className="p-spinner" style={{ width: size, height: size }} aria-hidden="true" />
);

/* ─── Stat card ── */
const StatCard = ({ icon, label, value, accent, loading }) => (
  <div className="p-stat" style={{ '--accent': accent }}>
    <div className="p-stat-icon">{icon}</div>
    <div className="p-stat-body">
      <span className="p-stat-value">
        {loading ? <span className="p-skel p-skel--sm" /> : value}
      </span>
      <span className="p-stat-label">{label}</span>
    </div>
  </div>
);

/* ─── Section card ── */
const Card = ({ title, children, accent }) => (
  <div className="p-card" style={{ '--accent': accent }}>
    <h4 className="p-card-title">{title}</h4>
    {children}
  </div>
);

/* ─── Tab button ── */
const Tab = ({ id, active, onClick, icon, label }) => (
  <button
    role="tab"
    aria-selected={active}
    className={`p-tab${active ? ' p-tab--active' : ''}`}
    onClick={() => onClick(id)}
  >
    {icon}
    <span>{label}</span>
  </button>
);

/* ─── Toast ── */
const Toast = ({ type, msg }) => (
  <div className={`p-toast p-toast--${type}`} role={type === 'error' ? 'alert' : 'status'}>
    {type === 'error'
      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    }
    {msg}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Profile() {
  const dispatch = useDispatch();

  /* ── auth selectors ── */
  const user           = useSelector(selectUser);
  const fetchStatus    = useSelector(selectAuthStatus);
  const updateStatus   = useSelector(selectUpdateStatus);
  const updateError    = useSelector(selectUpdateError);
  const passwordStatus = useSelector(selectPasswordStatus);
  const passwordError  = useSelector(selectPasswordError);

  /* ── data selectors for live stats ── */
  const blogs        = useSelector(selectAllBlogs);
  const blogsStatus  = useSelector(selectBlogsStatus);
  const blogsPagination = useSelector(selectBlogsPagination);
  const portfolios   = useSelector(selectAllPortfolios);
  const portStatus   = useSelector(selectPortfoliosStatus);
  const applications = useSelector(selectAllApplications);
  const appStatus    = useSelector(selectApplicationsStatus);
  const messages     = useSelector(selectMessages);
  const msgStatus    = useSelector(selectMessagesStatus);

  /* ── state ── */
  const [activeTab, setActiveTab] = useState('overview');
  const [profileForm, setProfileForm] = useState({ name: '', avatar: '', bio: '' });
  const [profileDirty, setProfileDirty] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLocalErr, setPwLocalErr] = useState('');
  const seeded = useRef(false);

  const roleMeta = ROLE_META[user?.role] ?? ROLE_META.USER;
  const isAdmin  = ['ADMIN', 'EDITOR', 'WRITER'].includes(user?.role);

  /* ── bootstrap ── */
  useEffect(() => {
    if (!user) dispatch(fetchMe());
  }, [dispatch, user]);

  useEffect(() => {
    if (isAdmin) {
      if (blogsStatus  === 'idle') dispatch(fetchBlogs());
      if (portStatus   === 'idle') dispatch(fetchAllPortfolios());
      if (appStatus    === 'idle') dispatch(fetchAllApplications());
      if (msgStatus    === 'idle') dispatch(fetchMessages());
    }
  }, [dispatch, isAdmin, blogsStatus, portStatus, appStatus, msgStatus]);

  useEffect(() => {
    if (user && !seeded.current) {
      setProfileForm({ name: user.name || '', avatar: user.avatar || '', bio: user.bio || '' });
      seeded.current = true;
    }
  }, [user]);

  useEffect(() => () => {
    dispatch(clearUpdateState());
    dispatch(clearPasswordState());
  }, [dispatch]);

  useEffect(() => {
    if (passwordStatus === 'succeeded') {
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    }
  }, [passwordStatus]);

  /* ── live stats ── */
  const stats = useMemo(() => {
    const pendingApps = applications.filter((a) => a.status === 'pending').length;
    const unreadMsgs  = messages.filter((m) => m.status === 'unread').length;
    return {
      // pagination.total reflects the site-wide count; blogs.length is capped
      // to whatever page size fetchBlogs() was called with.
      blogs:       blogsPagination.total || blogs.length,
      portfolios:  portfolios.length,
      pendingApps,
      unreadMsgs,
      memberSince: user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : '—',
    };
  }, [blogs, blogsPagination, portfolios, applications, messages, user]);

  /* ── handlers ── */
  const handleProfileChange = (e) => {
    setProfileForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setProfileDirty(true);
    if (updateError) dispatch(clearUpdateState());
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateMe({ name: profileForm.name, avatar: profileForm.avatar || undefined, bio: profileForm.bio || undefined }));
    setProfileDirty(false);
  };

  const handlePwChange = (e) => {
    setPwForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPwLocalErr('');
    if (passwordError) dispatch(clearPasswordState());
  };

  const handlePwSubmit = (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmNewPassword) { setPwLocalErr('New passwords do not match.'); return; }
    if (pwForm.newPassword.length < 6) { setPwLocalErr('Password must be at least 6 characters.'); return; }
    dispatch(changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }));
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    dispatch(clearUpdateState());
    dispatch(clearPasswordState());
    setPwLocalErr('');
  };

  /* ─── Loading skeleton ── */
  if (fetchStatus === 'loading' && !user) {
    return (
      <div className="p-page">
        <div className="p-orbs" aria-hidden="true">
          <div className="p-orb p-orb--1" /><div className="p-orb p-orb--2" /><div className="p-orb p-orb--3" />
        </div>
        <div className="p-shell p-shell--loading">
          <div className="p-header-skel">
            <div className="p-skel p-skel--avatar" />
            <div style={{ flex: 1 }}>
              <div className="p-skel" style={{ width: '40%', height: 28, marginBottom: 12 }} />
              <div className="p-skel" style={{ width: '60%', height: 16 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isUpdating  = updateStatus   === 'loading';
  const isSavingPw  = passwordStatus === 'loading';
  const pwErr       = pwLocalErr || passwordError;

  return (
    <div className="p-page">
      {/* Ambient orbs */}
      <div className="p-orbs" aria-hidden="true">
        <div className="p-orb p-orb--1" style={{ '--oc': roleMeta.glow }} />
        <div className="p-orb p-orb--2" />
        <div className="p-orb p-orb--3" style={{ '--oc': roleMeta.glow }} />
      </div>

      <div className="p-shell p-fade-up">

        {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
        <div className="p-header">
          <div className="p-avatar-wrap" style={{ '--ac': roleMeta.color, '--ag': roleMeta.glow }}>
            {user?.avatar
              ? <img src={user.avatar} alt={user?.name} className="p-avatar-img" />
              : <span className="p-avatar-initials">{initials(user?.name)}</span>
            }
            <div className="p-avatar-ring" />
          </div>

          <div className="p-header-info">
            <div className="p-name-row">
              <h1 className="p-username">{user?.name || '—'}</h1>
              <span className="p-role-badge" style={{ '--bc': roleMeta.color, '--bg': roleMeta.glow }}>
                <span className="p-role-sym">{roleMeta.symbol}</span>
                {roleMeta.label}
              </span>
            </div>

            {profileForm.bio && <p className="p-bio">{profileForm.bio}</p>}

            <div className="p-meta-row">
              <span className="p-meta-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Joined {stats.memberSince}
              </span>
              <span className="p-meta-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                {user?.email}
              </span>
            </div>
          </div>
        </div>

        {/* ══ TABS ══════════════════════════════════════════════════════════════ */}
        <div className="p-tabs" role="tablist">
          <Tab id="overview" active={activeTab === 'overview'} onClick={handleTabSwitch}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>}
            label="Overview"
          />
          <Tab id="edit" active={activeTab === 'edit'} onClick={handleTabSwitch}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
            label="Edit Profile"
          />
          <Tab id="security" active={activeTab === 'security'} onClick={handleTabSwitch}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            label="Security"
          />
        </div>

        {/* ══ OVERVIEW TAB ════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="p-content p-fade-up">

            {/* Live stats grid */}
            <div className="p-stats-grid">
              <StatCard
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                label="Blog Posts"
                value={stats.blogs}
                accent={roleMeta.color}
                loading={blogsStatus === 'loading'}
              />
              <StatCard
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>}
                label="Portfolios"
                value={stats.portfolios}
                accent={roleMeta.color}
                loading={portStatus === 'loading'}
              />
              {isAdmin && (
                <>
                  <StatCard
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                    label="Pending Apps"
                    value={stats.pendingApps}
                    accent="#f59e0b"
                    loading={appStatus === 'loading'}
                  />
                  <StatCard
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                    label="Unread Messages"
                    value={stats.unreadMsgs}
                    accent="#f43f5e"
                    loading={msgStatus === 'loading'}
                  />
                </>
              )}
            </div>

            {/* Quick actions — admin only */}
            {isAdmin && (
              <Card title="Quick Actions" accent={roleMeta.color}>
                <div className="p-actions">
                  <Link to="/admin" className="p-action-btn" style={{ '--ac': roleMeta.color }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/blogs" className="p-action-btn" style={{ '--ac': roleMeta.color }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Manage Blogs
                  </Link>
                  <Link to="/admin/applications" className="p-action-btn" style={{ '--ac': '#f59e0b' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    Applications {stats.pendingApps > 0 && <span className="p-badge">{stats.pendingApps}</span>}
                  </Link>
                  <Link to="/admin/messages" className="p-action-btn" style={{ '--ac': '#f43f5e' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Messages {stats.unreadMsgs > 0 && <span className="p-badge">{stats.unreadMsgs}</span>}
                  </Link>
                </div>
              </Card>
            )}

            {/* Recent blogs */}
            <Card title="Recent Blog Posts" accent={roleMeta.color}>
              {blogsStatus === 'loading' ? (
                <div className="p-list">
                  {[1,2,3].map(i => <div key={i} className="p-list-item p-list-item--skel"><div className="p-skel" style={{ width: '70%', height: 14 }} /><div className="p-skel" style={{ width: '30%', height: 12 }} /></div>)}
                </div>
              ) : blogs.length === 0 ? (
                <p className="p-empty">No blog posts yet.</p>
              ) : (
                <div className="p-list">
                  {blogs.slice(0, 5).map((b) => {
                    const href = b.status === 'PUBLISHED'
                      ? `/blog/${b.slug}`
                      : isAdmin ? `/admin/blog/edit/${b.slug}` : null;
                    const Row = href ? Link : 'div';
                    return (
                      <Row key={b.id} {...(href ? { to: href } : {})} className="p-list-item p-list-item--link">
                        <span
                          className="p-list-thumb"
                          style={b.coverImage ? { backgroundImage: `url(${b.coverImage})` } : undefined}
                        >
                          {!b.coverImage && (b.title?.[0]?.toUpperCase() || '?')}
                        </span>
                        <span className="p-list-body">
                          <span className="p-list-title">{b.title}</span>
                          <span className="p-list-submeta">
                            {b.category && <span className="p-list-chip">{b.category}</span>}
                            <span className="p-list-status" style={{ '--sc': BLOG_STATUS_COLOR[b.status] || '#94a3b8' }}>
                              {b.status}
                            </span>
                          </span>
                        </span>
                        <span className="p-list-meta">{formatBlogDate(b.publishedAt || b.createdAt)}</span>
                      </Row>
                    );
                  })}
                </div>
              )}
            </Card>

          </div>
        )}

        {/* ══ EDIT PROFILE TAB ════════════════════════════════════════════════ */}
        {activeTab === 'edit' && (
          <div className="p-content p-fade-up">
            <div className="p-form-card">
              <h3 className="p-section-title">Edit Profile</h3>

              {updateError    && <Toast type="error"   msg={updateError} />}
              {updateStatus === 'succeeded' && <Toast type="success" msg="Profile updated successfully." />}

              <form onSubmit={handleProfileSubmit} className="p-form" noValidate>
                <div className="p-field">
                  <label className="p-label">Email address</label>
                  <div className="p-readonly">
                    <span>{user?.email}</span>
                    <span className="p-readonly-tag">Read-only</span>
                  </div>
                </div>

                <div className="p-field">
                  <label htmlFor="name" className="p-label">Display name</label>
                  <input id="name" type="text" name="name" className="p-input"
                    placeholder="Your name" value={profileForm.name}
                    onChange={handleProfileChange} required autoComplete="name"
                  />
                </div>

                <div className="p-field">
                  <label htmlFor="bio" className="p-label">
                    Bio <span className="p-optional">(optional)</span>
                  </label>
                  <textarea id="bio" name="bio" className="p-input p-textarea"
                    placeholder="A short bio…" value={profileForm.bio}
                    onChange={handleProfileChange} rows={3}
                  />
                </div>

                <div className="p-field">
                  <label htmlFor="avatar" className="p-label">
                    Avatar URL <span className="p-optional">(optional)</span>
                  </label>
                  <input id="avatar" type="url" name="avatar" className="p-input"
                    placeholder="https://example.com/avatar.jpg" value={profileForm.avatar}
                    onChange={handleProfileChange} autoComplete="off"
                  />
                  {profileForm.avatar && (
                    <div className="p-avatar-preview">
                      <img src={profileForm.avatar} alt="Preview"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <span className="p-optional">Preview</span>
                    </div>
                  )}
                </div>

                <button type="submit" className="p-btn p-btn--primary"
                  disabled={isUpdating || !profileDirty}
                  style={{ '--ac': roleMeta.color, '--ag': roleMeta.glow }}
                >
                  {isUpdating ? <><Spinner />Saving…</> : 'Save changes'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ══ SECURITY TAB ════════════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <div className="p-content p-fade-up">
            <div className="p-form-card">
              <h3 className="p-section-title">Change Password</h3>

              {pwErr           && <Toast type="error"   msg={pwErr} />}
              {passwordStatus === 'succeeded' && <Toast type="success" msg="Password changed successfully." />}

              <form onSubmit={handlePwSubmit} className="p-form" noValidate>
                {[
                  { id: 'currentPassword', label: 'Current password',     key: 'current', auto: 'current-password' },
                  { id: 'newPassword',     label: 'New password',          key: 'new',     auto: 'new-password' },
                  { id: 'confirmNewPassword', label: 'Confirm new password', key: 'confirm', auto: 'new-password' },
                ].map(({ id, label, key, auto }) => (
                  <div className="p-field" key={id}>
                    <label htmlFor={id} className="p-label">{label}</label>
                    <div className="p-input-wrap">
                      <input id={id} type={showPw[key] ? 'text' : 'password'} name={id}
                        className="p-input" placeholder="••••••••"
                        value={pwForm[id]} onChange={handlePwChange}
                        required autoComplete={auto}
                      />
                      <button type="button" className="p-eye-btn"
                        onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))}
                        aria-label="Toggle visibility"
                      >
                        <EyeIcon visible={showPw[key]} />
                      </button>
                    </div>
                  </div>
                ))}

                <button type="submit" className="p-btn p-btn--primary"
                  disabled={isSavingPw}
                  style={{ '--ac': roleMeta.color, '--ag': roleMeta.glow }}
                >
                  {isSavingPw ? <><Spinner />Updating…</> : 'Update password'}
                </button>
              </form>

              <div className="p-divider" />

              <div className="p-danger-zone">
                <div>
                  <p className="p-danger-title">Sign out</p>
                  <p className="p-danger-desc">Sign out of this device.</p>
                </div>
                <button className="p-btn p-btn--danger" onClick={() => dispatch(logout())}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ══ STYLES ══════════════════════════════════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');

        /* ── CSS variables ── */
        .p-page {
          // --bg-deep:   #020b18;
          // --bg-1:      #060f1e;
          // --bg-2:      #0a1628;
          // --bg-3:      #0d1d35;
          --border:    rgba(56, 130, 210, 0.12);
          --border-hi: rgba(56, 130, 210, 0.25);
          // --text-1:    #e2eaf6;
          // --text-2:    #8ba5c8;
          // --text-3:    #4d6b8a;
          // --accent:    #38bdf8;
          // --font-body: 'DM Sans', sans-serif;
          // --font-head: 'Space Grotesk', sans-serif;
          min-height: 100vh;
          background: var(--bg-deep);
          font-family: var(--font-body);
          color: var(--text-1);
          position: relative;
          padding: 5rem 1rem;
          overflow-x: hidden;
        }

        /* ── Ambient orbs ── */
        .p-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .p-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.18;
        }
        .p-orb--1 {
          width: 500px; height: 500px;
          top: -100px; left: -100px;
          background: var(--oc, rgba(56,130,210,0.6));
        }
        .p-orb--2 {
          width: 350px; height: 350px;
          bottom: 10%; right: -80px;
          background: rgba(129,140,248,0.5);
        }
        .p-orb--3 {
          width: 280px; height: 280px;
          top: 40%; left: 55%;
          background: var(--oc, rgba(56,189,248,0.4));
          opacity: 0.1;
        }

        /* ── Shell ── */
        .p-shell {
          position: relative;
          z-index: 1;
          max-width: 820px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem 4rem;
        }
        .p-shell--loading { padding-top: 4rem; }

        /* ── Header ── */
        .p-header {
          display: flex;
          align-items: flex-start;
          gap: 1.75rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 0;
        }

        /* ── Avatar ── */
        .p-avatar-wrap {
          position: relative;
          flex-shrink: 0;
          width: 88px;
          height: 88px;
        }
        .p-avatar-img,
        .p-avatar-initials {
          width: 88px; height: 88px;
          border-radius: 50%;
          object-fit: cover;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .p-avatar-initials {
          background: linear-gradient(135deg, var(--bg-3), var(--bg-2));
          border: 2px solid var(--border-hi);
          font-family: var(--font-head);
          font-size: 1.6rem;
          font-weight: 600;
          color: var(--ac, var(--accent));
          letter-spacing: 0.02em;
        }
        .p-avatar-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1.5px solid var(--ac, var(--accent));
          opacity: 0.5;
          box-shadow: 0 0 20px var(--ag, rgba(56,189,248,0.3));
          animation: p-ring-pulse 3s ease-in-out infinite;
        }
        @keyframes p-ring-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.02); }
        }

        /* ── Header info ── */
        .p-header-info { flex: 1; min-width: 0; }

        .p-name-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.5rem;
        }
        .p-username {
          font-family: var(--font-head);
          font-size: 1.65rem;
          font-weight: 700;
          color: var(--text-1);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .p-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.65rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: var(--font-head);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--bc);
          background: color-mix(in srgb, var(--bc) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--bc) 30%, transparent);
          box-shadow: 0 0 12px color-mix(in srgb, var(--bc) 20%, transparent);
        }
        .p-role-sym { font-size: 0.9rem; }

        .p-bio {
          font-size: 0.9rem;
          color: var(--text-2);
          margin: 0 0 0.75rem;
          line-height: 1.5;
        }

        .p-meta-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .p-meta-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--text-3);
          background: rgba(56,130,210,0.06);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 0.2rem 0.55rem;
        }

        /* ── Tabs ── */
        .p-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid var(--border);
          margin-bottom: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .p-tabs::-webkit-scrollbar { display: none; }

        .p-tab {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 1rem 1.25rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-3);
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
          white-space: nowrap;
          margin-bottom: -1px;
        }
        .p-tab:hover { color: var(--text-2); }
        .p-tab--active {
          color: var(--text-1);
          border-bottom-color: var(--accent);
        }

        /* ── Content area ── */
        .p-content { display: flex; flex-direction: column; gap: 1.25rem; padding-top: 1.5rem; }

        /* ── Stats grid ── */
        .p-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 1rem;
        }
        .p-stat {
          background: linear-gradient(135deg, var(--bg-2), var(--bg-1));
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.9rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          position: relative;
          overflow: hidden;
        }
        .p-stat::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--accent, #38bdf8), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .p-stat:hover { border-color: var(--border-hi); box-shadow: 0 4px 24px rgba(0,0,0,0.3); }
        .p-stat:hover::before { opacity: 1; }
        .p-stat-icon { color: var(--accent, #38bdf8); opacity: 0.8; flex-shrink: 0; }
        .p-stat-body { display: flex; flex-direction: column; min-width: 0; }
        .p-stat-value {
          font-family: var(--font-head);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-1);
          line-height: 1;
          margin-bottom: 0.2rem;
        }
        .p-stat-label { font-size: 0.78rem; color: var(--text-3); }

        /* ── Card ── */
        .p-card {
          background: linear-gradient(135deg, var(--bg-2), var(--bg-1));
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          position: relative;
          overflow: hidden;
        }
        .p-card-title {
          font-family: var(--font-head);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-2);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border);
        }

        /* ── Quick actions ── */
        .p-actions {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.6rem;
        }
        .p-action-btn {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.65rem 1rem;
          background: rgba(56,130,210,0.06);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text-2);
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          position: relative;
        }
        .p-action-btn:hover {
          background: color-mix(in srgb, var(--ac, #38bdf8) 10%, transparent);
          border-color: color-mix(in srgb, var(--ac, #38bdf8) 35%, transparent);
          color: var(--text-1);
        }

        /* ── Badge ── */
        .p-badge {
          margin-left: auto;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          border-radius: 10px;
          background: rgba(244,63,94,0.2);
          border: 1px solid rgba(244,63,94,0.4);
          color: #fb7185;
          font-size: 0.7rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-head);
        }

        /* ── List ── */
        .p-list { display: flex; flex-direction: column; gap: 0; }
        .p-list-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0;
          border-bottom: 1px solid var(--border);
        }
        .p-list-item:last-child { border-bottom: none; }
        .p-list-item--skel { gap: 1rem; }
        .p-list-item--link { text-decoration: none; border-radius: 8px; transition: background 0.15s; }
        .p-list-item--link:hover { background: rgba(255,255,255,0.03); }
        .p-list-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .p-list-thumb {
          width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0;
          background-color: var(--bg-1); background-size: cover; background-position: center;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-3); font-family: var(--font-head); font-weight: 700; font-size: 0.9rem;
          border: 1px solid var(--border);
        }
        .p-list-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.2rem; }
        .p-list-title { font-size: 0.875rem; color: var(--text-1); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .p-list-submeta { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
        .p-list-chip { font-size: 0.68rem; padding: 1px 7px; border-radius: 999px; background: rgba(255,255,255,0.06); color: var(--text-3); }
        .p-list-status { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--sc, var(--text-3)); }
        .p-list-meta { font-size: 0.75rem; color: var(--text-3); flex-shrink: 0; }
        .p-empty { color: var(--text-3); font-size: 0.85rem; font-style: italic; margin: 0; }

        /* ── Form card ── */
        .p-form-card {
          background: linear-gradient(135deg, var(--bg-2), var(--bg-1));
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.75rem 2rem;
        }
        .p-section-title {
          font-family: var(--font-head);
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-1);
          margin: 0 0 1.25rem;
        }
        .p-form { display: flex; flex-direction: column; gap: 1.1rem; }
        .p-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .p-label { font-size: 0.8rem; font-weight: 500; color: var(--text-2); }
        .p-optional { font-weight: 400; color: var(--text-3); }

        .p-input {
          background: rgba(6,15,30,0.8);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.7rem 1rem;
          color: var(--text-1);
          font-family: var(--font-body);
          font-size: 0.9rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }
        .p-input::placeholder { color: var(--text-3); }
        .p-input:focus {
          border-color: var(--border-hi);
          box-shadow: 0 0 0 3px rgba(56,130,210,0.1);
        }
        .p-textarea { resize: vertical; min-height: 80px; }

        .p-input-wrap { position: relative; }
        .p-input-wrap .p-input { padding-right: 2.75rem; }
        .p-eye-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-3);
          cursor: pointer;
          padding: 4px;
          display: flex;
          transition: color 0.2s;
        }
        .p-eye-btn:hover { color: var(--text-2); }

        .p-readonly {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.7rem 1rem;
          background: rgba(6,15,30,0.5);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 0.9rem;
          color: var(--text-3);
        }
        .p-readonly-tag {
          font-size: 0.7rem;
          color: var(--text-3);
          background: rgba(56,130,210,0.08);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 0.15rem 0.4rem;
        }

        .p-avatar-preview {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .p-avatar-preview img {
          width: 44px; height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--border-hi);
        }

        /* ── Buttons ── */
        .p-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          border-radius: 10px;
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .p-btn--primary {
          padding: 0.75rem 1.5rem;
          background: color-mix(in srgb, var(--ac, #38bdf8) 18%, transparent);
          border: 1px solid color-mix(in srgb, var(--ac, #38bdf8) 40%, transparent);
          color: var(--ac, #38bdf8);
          align-self: flex-start;
          margin-top: 0.25rem;
        }
        .p-btn--primary:hover:not(:disabled) {
          background: color-mix(in srgb, var(--ac, #38bdf8) 25%, transparent);
          box-shadow: 0 4px 20px var(--ag, rgba(56,189,248,0.25));
        }
        .p-btn--primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .p-btn--danger {
          padding: 0.65rem 1.25rem;
          background: rgba(244,63,94,0.08);
          border: 1px solid rgba(244,63,94,0.25);
          color: #fb7185;
        }
        .p-btn--danger:hover {
          background: rgba(244,63,94,0.15);
          border-color: rgba(244,63,94,0.45);
        }

        /* ── Toast ── */
        .p-toast {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }
        .p-toast--error   { background: rgba(244,63,94,0.08);  border: 1px solid rgba(244,63,94,0.2);  color: #fca5a5; }
        .p-toast--success { background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); color: #6ee7b7; }

        /* ── Divider ── */
        .p-divider { height: 1px; background: var(--border); margin: 1.5rem 0; }

        /* ── Danger zone ── */
        .p-danger-zone {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .p-danger-title { font-weight: 600; color: #fca5a5; margin: 0; font-size: 0.9rem; }
        .p-danger-desc  { color: var(--text-3); font-size: 0.8rem; margin: 0.2rem 0 0; }

        /* ── Skeleton ── */
        .p-skel {
          background: linear-gradient(90deg, rgba(56,130,210,0.08) 25%, rgba(56,130,210,0.14) 50%, rgba(56,130,210,0.08) 75%);
          background-size: 200% 100%;
          border-radius: 6px;
          animation: p-shimmer 1.6s ease-in-out infinite;
          display: block;
        }
        .p-skel--sm  { width: 48px; height: 1em; display: inline-block; border-radius: 4px; }
        .p-skel--avatar { width: 88px; height: 88px; border-radius: 50%; }
        @keyframes p-shimmer {
          0%   { background-position:  200% 0; }
          100% { background-position: -200% 0; }
        }
        .p-header-skel { display: flex; gap: 1.75rem; align-items: center; }

        /* ── Spinner ── */
        .p-spinner {
          display: inline-block;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: currentColor;
          animation: p-spin 0.7s linear infinite;
        }
        @keyframes p-spin { to { transform: rotate(360deg); } }

        /* ── Fade-up ── */
        .p-fade-up { animation: p-fade-up 0.35s ease both; }
        @keyframes p-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .p-shell { padding: 1.5rem 1rem 3rem; }
          .p-header { flex-direction: column; align-items: center; text-align: center; }
          .p-name-row { justify-content: center; }
          .p-meta-row { justify-content: center; }
          .p-stats-grid { grid-template-columns: 1fr 1fr; }
          .p-actions { grid-template-columns: 1fr; }
          .p-form-card { padding: 1.25rem 1rem; }
          .p-btn--primary { width: 100%; }
        }
      `}</style>
    </div>
  );
}