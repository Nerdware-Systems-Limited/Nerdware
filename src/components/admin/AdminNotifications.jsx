import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Mail, Briefcase } from 'lucide-react';
import api from '../../redux/api/kyClient';

const formatRelative = (s) => {
  if (!s) return '';
  const mins = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

/**
 * Real notifications for admins: unread contact messages + pending
 * applications, fetched directly (not via the shared redux slices those
 * pages use) so opening this dropdown never clobbers whatever page/filter
 * AdminMessages or AdminApplications currently has loaded.
 */
const AdminNotifications = ({ isAdmin }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ messages: [], messagesTotal: 0, applications: [], applicationsTotal: 0 });
  const rootRef = useRef(null);

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const authedApi = api.extend({ headers: { Authorization: `Bearer ${token}` } });
      const [msgRes, appRes] = await Promise.all([
        authedApi.get('contact', { searchParams: { status: 'UNREAD', limit: 4 } }).json(),
        authedApi.get('applications', { searchParams: { status: 'PENDING', limit: 4 } }).json(),
      ]);
      setData({
        messages: msgRes.data?.messages || [],
        messagesTotal: msgRes.data?.pagination?.total ?? 0,
        applications: appRes.data?.applications || [],
        applicationsTotal: appRes.data?.pagination?.total ?? 0,
      });
    } catch {
      // Keep whatever was last loaded rather than clearing it on a blip.
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!open) return undefined;
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  if (!isAdmin) return null;

  const total = data.messagesTotal + data.applicationsTotal;

  return (
    <div className="nw-notif" ref={rootRef}>
      <button
        type="button"
        className="nw-icon-btn"
        aria-label="Notifications"
        onClick={() => { setOpen((v) => !v); load(); }}
      >
        <Bell size={17} />
        {total > 0 && <span className="nw-notif__badge">{total > 9 ? '9+' : total}</span>}
      </button>

      {open && (
        <div className="nw-notif__panel">
          <div className="nw-notif__hd">Notifications</div>

          {loading && !data.messages.length && !data.applications.length ? (
            <div className="nw-notif__empty"><span className="nw-spinner" /> Loading…</div>
          ) : total === 0 ? (
            <div className="nw-notif__empty">You're all caught up.</div>
          ) : (
            <>
              {data.messages.length > 0 && (
                <div className="nw-notif__section">
                  <div className="nw-notif__section-hd"><Mail size={13} /> New messages</div>
                  {data.messages.map((m) => (
                    <Link key={m.id} to="/admin/messages" className="nw-notif__item" onClick={() => setOpen(false)}>
                      <span className="nw-notif__item-title">{m.name || m.email || 'Unknown'}</span>
                      <span className="nw-notif__item-sub">{m.subject || '(no subject)'}</span>
                      <span className="nw-notif__item-time">{formatRelative(m.createdAt)}</span>
                    </Link>
                  ))}
                  {data.messagesTotal > data.messages.length && (
                    <Link to="/admin/messages" className="nw-notif__more" onClick={() => setOpen(false)}>
                      View all {data.messagesTotal} unread
                    </Link>
                  )}
                </div>
              )}

              {data.applications.length > 0 && (
                <div className="nw-notif__section">
                  <div className="nw-notif__section-hd"><Briefcase size={13} /> Pending applications</div>
                  {data.applications.map((a) => (
                    <Link key={a.id} to="/admin/applications" className="nw-notif__item" onClick={() => setOpen(false)}>
                      <span className="nw-notif__item-title">{a.name || a.fullName || 'Unknown'}</span>
                      <span className="nw-notif__item-sub">{a.position || a.role || '—'}</span>
                      <span className="nw-notif__item-time">{formatRelative(a.createdAt)}</span>
                    </Link>
                  ))}
                  {data.applicationsTotal > data.applications.length && (
                    <Link to="/admin/applications" className="nw-notif__more" onClick={() => setOpen(false)}>
                      View all {data.applicationsTotal} pending
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
