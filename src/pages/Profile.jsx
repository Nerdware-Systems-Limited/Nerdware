import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchMe,
  updateMe,
  changePassword,
  logout,
  clearUpdateState,
  clearPasswordState,
  selectUser,
  selectAuthStatus,
  selectUpdateStatus,
  selectUpdateError,
  selectPasswordStatus,
  selectPasswordError,
} from '../redux/slices/authslice';

/* ─── tiny helpers ────────────────────────────────────────────────────────── */
const initials = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const ROLE_META = {
  ADMIN:  { label: 'Admin',  color: '#f59e0b', canManage: true },
  EDITOR: { label: 'Editor', color: '#6366f1', canManage: true },
  WRITER: { label: 'Writer', color: '#10b981', canManage: true },
  USER:   { label: 'User',   color: '#64748b', canManage: false },
};

const EyeIcon = ({ visible }) =>
  visible ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

/* ─── Manage Site banner ──────────────────────────────────────────────────── */
const ManageSiteBanner = ({ role }) => {
  const meta = ROLE_META[role];
  if (!meta?.canManage) return null;

  return (
    <Link to="/admin" className="manage-site-banner" style={{ '--role-color': meta.color }}>
      <div className="manage-site-banner__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <div className="manage-site-banner__body">
        <span className="manage-site-banner__title">Manage site</span>
        <span className="manage-site-banner__sub">
          Open the {meta.label} dashboard
        </span>
      </div>
      <svg className="manage-site-banner__arrow" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>

      <style>{`
        .manage-site-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          margin-bottom: 1.5rem;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--role-color) 12%, transparent),
            color-mix(in srgb, var(--role-color) 6%, transparent)
          );
          border: 1px solid color-mix(in srgb, var(--role-color) 30%, transparent);
          text-decoration: none;
          color: inherit;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          cursor: pointer;
        }
        .manage-site-banner:hover {
          background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--role-color) 20%, transparent),
            color-mix(in srgb, var(--role-color) 10%, transparent)
          );
          border-color: color-mix(in srgb, var(--role-color) 55%, transparent);
          transform: translateY(-1px);
        }
        .manage-site-banner__icon {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: color-mix(in srgb, var(--role-color) 18%, transparent);
          border: 1px solid color-mix(in srgb, var(--role-color) 35%, transparent);
          display: grid;
          place-items: center;
          color: var(--role-color);
        }
        .manage-site-banner__body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .manage-site-banner__title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--role-color);
          letter-spacing: 0.01em;
        }
        .manage-site-banner__sub {
          font-size: 0.78rem;
          opacity: 0.65;
        }
        .manage-site-banner__arrow {
          flex-shrink: 0;
          opacity: 0.5;
          transition: opacity 0.2s, transform 0.2s;
          color: var(--role-color);
        }
        .manage-site-banner:hover .manage-site-banner__arrow {
          opacity: 1;
          transform: translateX(3px);
        }
      `}</style>
    </Link>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function Profile() {
  const dispatch       = useDispatch();
  const user           = useSelector(selectUser);
  const fetchStatus    = useSelector(selectAuthStatus);
  const updateStatus   = useSelector(selectUpdateStatus);
  const updateError    = useSelector(selectUpdateError);
  const passwordStatus = useSelector(selectPasswordStatus);
  const passwordError  = useSelector(selectPasswordError);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'

  /* ── profile form ── */
  const [profileForm, setProfileForm] = useState({ name: '', avatar: '' });
  const [profileDirty, setProfileDirty] = useState(false);

  /* ── password form ── */
  const [pwForm, setPwForm]     = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [show, setShow]         = useState({ current: false, new: false, confirm: false });
  const [pwLocalErr, setPwLocalErr] = useState('');

  /* seed form from store once user loads */
  const seeded = useRef(false);
  useEffect(() => {
    if (!user) dispatch(fetchMe());
  }, [dispatch, user]);

  useEffect(() => {
    if (user && !seeded.current) {
      setProfileForm({ name: user.name || '', avatar: user.avatar || '' });
      seeded.current = true;
    }
  }, [user]);

  /* cleanup on unmount */
  useEffect(() => () => {
    dispatch(clearUpdateState());
    dispatch(clearPasswordState());
  }, [dispatch]);

  /* reset password form on success */
  useEffect(() => {
    if (passwordStatus === 'succeeded') {
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    }
  }, [passwordStatus]);

  /* ── handlers ── */
  const handleProfileChange = (e) => {
    setProfileForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setProfileDirty(true);
    if (updateError) dispatch(clearUpdateState());
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateMe({ name: profileForm.name, avatar: profileForm.avatar || undefined }));
    setProfileDirty(false);
  };

  const handlePwChange = (e) => {
    setPwForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setPwLocalErr('');
    if (passwordError) dispatch(clearPasswordState());
  };

  const handlePwSubmit = (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      setPwLocalErr('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwLocalErr('New password must be at least 6 characters.');
      return;
    }
    dispatch(changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }));
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    dispatch(clearUpdateState());
    dispatch(clearPasswordState());
    setPwLocalErr('');
  };

  /* ── loading skeleton ── */
  if (fetchStatus === 'loading' && !user) {
    return (
      <div className="auth-page">
        <div className="auth-glow" aria-hidden="true" />
        <div className="profile-card fade-in-up">
          <div className="profile-skeleton-avatar skeleton" />
          <div className="skeleton skeleton-title" style={{ width: '40%', margin: '1rem auto 0.5rem' }} />
          <div className="skeleton skeleton-text"  style={{ width: '28%', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  const roleMeta     = ROLE_META[user?.role] ?? ROLE_META.USER;
  const isUpdating   = updateStatus   === 'loading';
  const isSavingPw   = passwordStatus === 'loading';
  const pwDisplayErr = pwLocalErr || passwordError;

  return (
    <div className="auth-page profile-page">
      <div className="auth-glow" aria-hidden="true" />

      <div className="profile-card fade-in-up">

        {/* ── Manage site banner (admins / editors / writers only) ── */}
        <ManageSiteBanner role={user?.role} />

        {/* ── Avatar + identity ── */}
        <div className="profile-hero">
          <div className="profile-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user?.name} className="profile-avatar-img" />
            ) : (
              <span className="profile-avatar-initials">{initials(user?.name)}</span>
            )}
          </div>
          <div className="profile-identity">
            <h2 className="auth-heading" style={{ marginBottom: '0.2rem' }}>{user?.name || '—'}</h2>
            <p className="profile-email">{user?.email}</p>
            {user?.role && (
              <span
                className="profile-role-badge"
                style={{ background: `color-mix(in srgb, ${roleMeta.color} 15%, transparent)`,
                         color: roleMeta.color,
                         border: `1px solid color-mix(in srgb, ${roleMeta.color} 35%, transparent)` }}
              >
                {roleMeta.label}
              </span>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="profile-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'profile'}
            className={`profile-tab ${activeTab === 'profile' ? 'profile-tab--active' : ''}`}
            onClick={() => handleTabSwitch('profile')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Profile info
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'security'}
            className={`profile-tab ${activeTab === 'security' ? 'profile-tab--active' : ''}`}
            onClick={() => handleTabSwitch('security')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Security
          </button>
        </div>

        {/* ══ PROFILE TAB ══════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="auth-form" noValidate>

            {updateError && (
              <div className="auth-alert" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {updateError}
              </div>
            )}

            {updateStatus === 'succeeded' && (
              <div className="auth-success" role="status">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Profile updated successfully.
              </div>
            )}

            {/* Read-only email */}
            <div className="auth-field">
              <label className="form-label">Email address</label>
              <div className="profile-readonly-field">
                <span>{user?.email}</span>
                <span className="profile-readonly-tag">Read-only</span>
              </div>
            </div>

            {/* Editable name */}
            <div className="auth-field">
              <label htmlFor="name" className="form-label">Display name</label>
              <input
                id="name"
                type="text"
                name="name"
                className="form-control"
                placeholder="Your name"
                value={profileForm.name}
                onChange={handleProfileChange}
                required
                autoComplete="name"
              />
            </div>

            {/* Avatar URL */}
            <div className="auth-field">
              <label htmlFor="avatar" className="form-label">
                Avatar URL
                <span className="profile-optional"> — optional</span>
              </label>
              <input
                id="avatar"
                type="url"
                name="avatar"
                className="form-control"
                placeholder="https://example.com/avatar.jpg"
                value={profileForm.avatar}
                onChange={handleProfileChange}
                autoComplete="off"
              />
              {profileForm.avatar && (
                <div className="profile-avatar-preview">
                  <img
                    src={profileForm.avatar}
                    alt="Avatar preview"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span className="profile-optional">Preview</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={isUpdating || !profileDirty}
            >
              {isUpdating ? (
                <><span className="auth-spinner" aria-hidden="true" />Saving…</>
              ) : 'Save changes'}
            </button>
          </form>
        )}

        {/* ══ SECURITY TAB ═════════════════════════════════════════════════════ */}
        {activeTab === 'security' && (
          <div>
            {/* Member since */}
            {user?.createdAt && (
              <div className="profile-meta-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Member since{' '}
                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            )}

            <div className="auth-divider" style={{ margin: '1.25rem 0' }} />

            <h5 className="profile-section-title">Change password</h5>

            {pwDisplayErr && (
              <div className="auth-alert" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {pwDisplayErr}
              </div>
            )}

            {passwordStatus === 'succeeded' && (
              <div className="auth-success" role="status">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Password changed successfully.
              </div>
            )}

            <form onSubmit={handlePwSubmit} className="auth-form" noValidate style={{ marginTop: '1rem' }}>
              {/* Current password */}
              <div className="auth-field">
                <label htmlFor="currentPassword" className="form-label">Current password</label>
                <div className="auth-input-wrapper">
                  <input
                    id="currentPassword"
                    type={show.current ? 'text' : 'password'}
                    name="currentPassword"
                    className="form-control"
                    placeholder="••••••••"
                    value={pwForm.currentPassword}
                    onChange={handlePwChange}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShow((s) => ({ ...s, current: !s.current }))} aria-label="Toggle">
                    <EyeIcon visible={show.current} />
                  </button>
                </div>
              </div>

              <div className="auth-divider" />

              {/* New password */}
              <div className="auth-field">
                <label htmlFor="newPassword" className="form-label">New password</label>
                <div className="auth-input-wrapper">
                  <input
                    id="newPassword"
                    type={show.new ? 'text' : 'password'}
                    name="newPassword"
                    className="form-control"
                    placeholder="Min. 6 characters"
                    value={pwForm.newPassword}
                    onChange={handlePwChange}
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShow((s) => ({ ...s, new: !s.new }))} aria-label="Toggle">
                    <EyeIcon visible={show.new} />
                  </button>
                </div>
              </div>

              {/* Confirm new */}
              <div className="auth-field">
                <label htmlFor="confirmNewPassword" className="form-label">Confirm new password</label>
                <div className="auth-input-wrapper">
                  <input
                    id="confirmNewPassword"
                    type={show.confirm ? 'text' : 'password'}
                    name="confirmNewPassword"
                    className="form-control"
                    placeholder="Re-enter new password"
                    value={pwForm.confirmNewPassword}
                    onChange={handlePwChange}
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))} aria-label="Toggle">
                    <EyeIcon visible={show.confirm} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={isSavingPw}
              >
                {isSavingPw ? (
                  <><span className="auth-spinner" aria-hidden="true" />Updating…</>
                ) : 'Update password'}
              </button>
            </form>

            {/* Danger zone */}
            <div className="auth-divider" style={{ margin: '1.75rem 0 1.25rem' }} />
            <div className="profile-danger-zone">
              <div>
                <p className="profile-danger-title">Sign out</p>
                <p className="profile-danger-desc">You will be redirected to the login page.</p>
              </div>
              <button
                type="button"
                className="btn profile-btn-danger"
                onClick={() => dispatch(logout())}
              >
                Sign out
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}