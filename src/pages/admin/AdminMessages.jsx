import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Mail, MailOpen, Trash2, Reply, Send,
  Archive, Inbox, Star, StarOff, X, AlertCircle,
  Clock, CheckCheck, MessageSquare,
} from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import EmptyState from '../../components/admin/EmptyState';

import {
  fetchMessages,
  updateMessageStatus,
  selectMessages,
  selectMessagesStatus,
  selectMessageActionStatus,
  selectMessageActionError,
  clearMessageActionState,
} from '../../redux/slices/miscSlice';

/* miscSlice exposes no selectMessagesError — read the raw state directly */
const selectMessagesError = (state) => state.misc.messagesError ?? null;

/* ─── helpers ────────────────────────────────────────────────────────────── */
const initials = (name = '?') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const formatDate = (iso) => {
  if (!iso) return '';
  const d   = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const diffDays = Math.floor((now - d) / 86_400_000);
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/* miscSlice stores a `status` field per message: 'UNREAD' | 'READ' | 'ARCHIVED' */
const isUnread   = (m) => m.status === 'UNREAD';
const isRead     = (m) => m.status === 'READ';
const isArchived = (m) => m.status === 'ARCHIVED';
/* starred is a client-side concept — the slice doesn't have it,
   so we derive it from a local Set and patch via updateMessageStatus if your
   backend supports a 'STARRED' status; otherwise it's purely local.         */

const FILTERS = [
  { id: 'ALL',      label: 'All',      icon: MessageSquare },
  { id: 'UNREAD',   label: 'Unread',   icon: Mail },
  { id: 'READ',     label: 'Read',     icon: MailOpen },
  { id: 'ARCHIVED', label: 'Archived', icon: Archive },
];

/* hue seed from initials so each avatar gets a consistent colour */
const avatarHue = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff;
  return h % 360;
};

/* ============================================================ component === */
const AdminMessages = () => {
  const dispatch  = useDispatch();
  const messages  = useSelector(selectMessages);
  const status    = useSelector(selectMessagesStatus);
  const error     = useSelector(selectMessagesError);
  const actStatus = useSelector(selectMessageActionStatus);
  const actError  = useSelector(selectMessageActionError);

  const [filter, setFilter]     = useState('ALL');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);
  const [modal, setModal]       = useState(null);   // 'delete'
  const [reply, setReply]       = useState('');
  const [replyErr, setReplyErr] = useState('');
  /* local starred set — persisted in sessionStorage so it survives re-renders */
  const [starred, setStarred]   = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem('nw-starred') || '[]')); }
    catch { return new Set(); }
  });

  /* ── fetch ──────────────────────────────────────────────────────────── */
  useEffect(() => { dispatch(fetchMessages()); }, [dispatch]);

  /* ── close modals after successful action ───────────────────────────── */
  useEffect(() => {
    if (actStatus === 'succeeded') {
      setModal(null);
      setReply('');
      dispatch(clearMessageActionState());
      dispatch(fetchMessages());
    }
  }, [actStatus, dispatch]);

  /* ── derived counts ─────────────────────────────────────────────────── */
  const counts = useMemo(() => ({
    ALL:      messages.length,
    UNREAD:   messages.filter(isUnread).length,
    READ:     messages.filter(isRead).length,
    ARCHIVED: messages.filter(isArchived).length,
  }), [messages]);

  /* ── filtered list ──────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...messages]
      .filter((m) => {
        if (filter !== 'ALL' && m.status !== filter) return false;
        if (!q) return true;
        return [m.name, m.email, m.subject, m.message]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [messages, filter, search]);

  /* ── handlers ───────────────────────────────────────────────────────── */
  const openMessage = (m) => {
    setSelected(m);
    if (m.status === 'UNREAD') dispatch(updateMessageStatus({ id: m.id, status: 'READ' }));
  };

  const markArchive = (m) => {
    dispatch(updateMessageStatus({ id: m.id, status: 'ARCHIVED' }));
    if (selected?.id === m.id) setSelected(null);
  };

  const toggleStar = (m, e) => {
    e?.stopPropagation();
    setStarred((prev) => {
      const next = new Set(prev);
      next.has(m.id) ? next.delete(m.id) : next.add(m.id);
      sessionStorage.setItem('nw-starred', JSON.stringify([...next]));
      return next;
    });
  };

  const confirmDelete = () => {
    if (!selected) return;
    /* miscSlice doesn't have a delete thunk, so we archive instead.
       If your backend gains DELETE /contact/:id, swap this line:          */
    dispatch(updateMessageStatus({ id: selected.id, status: 'ARCHIVED' }));
    setSelected(null);
  };

  const sendReply = () => {
    if (!reply.trim()) { setReplyErr('Reply cannot be empty.'); return; }
    /* open mailto: — replace with your email thunk when available */
    window.location.href =
      `mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || ''}`)}` +
      `&body=${encodeURIComponent(reply.trim())}`;
    setModal(null);
    setReply('');
  };

  const isLoading = status === 'loading' && !messages.length;

  /* ============================== render ================================ */
  return (
    <>
      <style>{`
        /* ── inbox layout ──────────────────────────────────────────── */
        .nw-inbox {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 0;
          border: 1px solid var(--nw-border, rgba(255,255,255,0.08));
          border-radius: 14px;
          overflow: hidden;
          min-height: 560px;
          background: var(--nw-surface, rgba(255,255,255,0.02));
        }
        @media (max-width: 860px) {
          .nw-inbox { grid-template-columns: 1fr; }
          .nw-inbox__detail { display: none; }
          .nw-inbox--detail-open .nw-inbox__list   { display: none; }
          .nw-inbox--detail-open .nw-inbox__detail { display: flex; }
        }

        /* ── list pane ─────────────────────────────────────────────── */
        .nw-inbox__list {
          border-right: 1px solid var(--nw-border, rgba(255,255,255,0.08));
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        /* ── detail pane ───────────────────────────────────────────── */
        .nw-inbox__detail {
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        /* ── message row ───────────────────────────────────────────── */
        .nw-msg {
          display: grid;
          grid-template-columns: 38px 1fr 20px;
          gap: 10px;
          align-items: start;
          padding: 13px 14px;
          border: none;
          border-bottom: 1px solid var(--nw-border, rgba(255,255,255,0.06));
          background: transparent;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: background 0.13s;
          position: relative;
        }
        .nw-msg:last-child { border-bottom: none; }
        .nw-msg:hover      { background: rgba(255,255,255,0.04); }
        .nw-msg.is-open    { background: rgba(238,79,39,0.07); }
        .nw-msg.is-unread  { background: rgba(255,255,255,0.035); }
        .nw-msg.is-unread::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: var(--nw-accent, #EE4F27);
          border-radius: 0 2px 2px 0;
        }

        .nw-msg__avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          display: grid; place-items: center;
          font-size: 12px; font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          user-select: none;
        }

        .nw-msg__body { min-width: 0; }

        .nw-msg__row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 2px;
        }
        .nw-msg__name {
          font-size: 13px; font-weight: 600;
          color: var(--nw-text, #fff);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .nw-msg.is-unread .nw-msg__name { color: #fff; }
        .nw-msg__date { font-size: 11px; color: var(--nw-text-dim, rgba(255,255,255,0.35)); flex-shrink: 0; }
        .nw-msg__subject {
          font-size: 12px; font-weight: 500;
          color: var(--nw-text-muted, rgba(255,255,255,0.55));
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 2px;
        }
        .nw-msg.is-unread .nw-msg__subject { color: rgba(255,255,255,0.8); }
        .nw-msg__preview {
          font-size: 12px;
          color: var(--nw-text-dim, rgba(255,255,255,0.35));
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .nw-msg__star {
          color: var(--nw-text-dim, rgba(255,255,255,0.3));
          transition: color 0.15s, transform 0.15s;
          padding: 2px;
          margin-top: 2px;
          cursor: pointer;
          background: none; border: none;
        }
        .nw-msg__star:hover  { color: #fbbf24; transform: scale(1.2); }
        .nw-msg__star.is-on  { color: #fbbf24; }

        /* ── detail article ────────────────────────────────────────── */
        .nw-detail {
          display: flex; flex-direction: column;
          height: 100%; padding: 28px 28px 20px;
          gap: 0;
        }
        .nw-detail__head {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 16px;
          margin-bottom: 18px;
        }
        .nw-detail__from { display: flex; align-items: center; gap: 14px; min-width: 0; }
        .nw-detail__avatar {
          width: 46px; height: 46px;
          border-radius: 50%;
          display: grid; place-items: center;
          font-size: 15px; font-weight: 700;
          color: #fff; flex-shrink: 0;
        }
        .nw-detail__name { font-weight: 700; font-size: 15px; margin-bottom: 2px; }
        .nw-detail__email { font-size: 12px; color: var(--nw-accent, #EE4F27); text-decoration: none; }
        .nw-detail__email:hover { text-decoration: underline; }
        .nw-detail__meta {
          display: flex; flex-direction: column; align-items: flex-end;
          gap: 6px; flex-shrink: 0;
        }
        .nw-detail__date { font-size: 11px; color: var(--nw-text-dim, rgba(255,255,255,0.35)); }

        .nw-detail__subject {
          font-size: 18px; font-weight: 700;
          margin: 0 0 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--nw-border, rgba(255,255,255,0.08));
          line-height: 1.3;
        }
        .nw-detail__body {
          flex: 1;
          font-size: 14px; line-height: 1.75;
          color: var(--nw-text-muted, rgba(255,255,255,0.7));
          white-space: pre-wrap;
          margin-bottom: 24px;
        }
        .nw-detail__actions {
          display: flex; gap: 8px; flex-wrap: wrap;
          padding-top: 16px;
          border-top: 1px solid var(--nw-border, rgba(255,255,255,0.08));
          margin-top: auto;
        }

        /* ── empty detail state ────────────────────────────────────── */
        .nw-inbox__placeholder {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 100%; gap: 10px;
          color: var(--nw-text-dim, rgba(255,255,255,0.3));
        }
        .nw-inbox__placeholder p { font-size: 13px; margin: 0; }

        /* ── filter chips ──────────────────────────────────────────── */
        .nw-msg-filters {
          display: flex; gap: 6px; flex-wrap: wrap;
          padding: 10px 14px;
          border-bottom: 1px solid var(--nw-border, rgba(255,255,255,0.08));
          background: rgba(255,255,255,0.015);
        }

        /* ── search inside list pane ────────────────────────────────── */
        .nw-msg-search {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 14px;
          border-bottom: 1px solid var(--nw-border, rgba(255,255,255,0.08));
          background: rgba(255,255,255,0.02);
        }
        .nw-msg-search input {
          flex: 1; background: none; border: none; outline: none;
          color: var(--nw-text, #fff); font-size: 13px;
        }
        .nw-msg-search input::placeholder { color: rgba(255,255,255,0.3); }
        .nw-msg-search__clear {
          background: none; border: none; cursor: pointer; padding: 2px;
          color: rgba(255,255,255,0.35); display: flex;
          transition: color 0.15s;
        }
        .nw-msg-search__clear:hover { color: rgba(255,255,255,0.7); }

        /* ── back button (mobile) ───────────────────────────────────── */
        .nw-detail__back {
          display: none;
          align-items: center; gap: 6px;
          font-size: 13px; color: var(--nw-text-muted);
          background: none; border: none; cursor: pointer; padding: 0;
          margin-bottom: 16px;
        }
        @media (max-width: 860px) { .nw-detail__back { display: flex; } }
      `}</style>

      <PageHeader
        title="Messages"
        subtitle="Manage contact form submissions and inquiries."
        actions={
          counts.UNREAD > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 999,
              background: 'rgba(238,79,39,0.15)',
              color: 'var(--nw-accent, #EE4F27)',
              fontSize: 13, fontWeight: 600,
            }}>
              <Mail size={14} /> {counts.UNREAD} unread
            </span>
          )
        }
      />

      {actError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 10, marginBottom: 12,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          color: '#fca5a5', fontSize: 13,
        }}>
          <AlertCircle size={15} /> {String(actError)}
        </div>
      )}

      <div className={`nw-inbox${selected ? ' nw-inbox--detail-open' : ''}`}>
        {/* ── LEFT: list pane ─────────────────────────────────────────────── */}
        <aside className="nw-inbox__list">
          {/* Filter chips */}
          <div className="nw-msg-filters">
            {FILTERS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => { setFilter(id); setSelected(null); }}
                className={`nw-btn nw-btn--sm ${filter === id ? 'nw-btn--primary' : 'nw-btn--ghost'}`}
              >
                <Icon size={13} />
                {label}
                <span style={{
                  padding: '0 6px', borderRadius: 999,
                  background: 'rgba(0,0,0,0.25)', fontSize: 10,
                }}>{counts[id]}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="nw-msg-search">
            <Search size={14} color="rgba(255,255,255,0.4)" />
            <input
              placeholder="Search messages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="nw-msg-search__clear" onClick={() => setSearch('')}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* List body */}
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 20, color: 'var(--nw-text-muted)' }}>
              <span className="nw-spinner" /> Loading messages…
            </div>
          ) : error ? (
            <div style={{ padding: 20, color: '#fca5a5', fontSize: 13 }}>{String(error)}</div>
          ) : !filtered.length ? (
            <EmptyState
              icon={Inbox}
              title={search || filter !== 'ALL' ? 'No matching messages' : 'No messages yet'}
              message={search || filter !== 'ALL' ? 'Try a different search or filter.' : 'Contact form submissions will appear here.'}
            />
          ) : (
            filtered.map((m) => {
              const isOpen  = selected?.id === m.id;
              const isStarred = starred.has(m.id);
              const hue = avatarHue(m.name || m.email || '');
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`nw-msg${m.status === 'UNREAD' ? ' is-unread' : ''}${isOpen ? ' is-open' : ''}`}
                  onClick={() => openMessage(m)}
                >
                  <div
                    className="nw-msg__avatar"
                    style={{ background: `hsl(${hue},45%,38%)` }}
                    aria-hidden="true"
                  >
                    {initials(m.name)}
                  </div>
                  <div className="nw-msg__body">
                    <div className="nw-msg__row">
                      <span className="nw-msg__name">{m.name || m.email || 'Unknown'}</span>
                      <span className="nw-msg__date">{formatDate(m.createdAt)}</span>
                    </div>
                    <div className="nw-msg__subject">{m.subject || '(no subject)'}</div>
                    <div className="nw-msg__preview">{m.message}</div>
                  </div>
                  <button
                    type="button"
                    className={`nw-msg__star${isStarred ? ' is-on' : ''}`}
                    onClick={(e) => toggleStar(m, e)}
                    aria-label={isStarred ? 'Unstar' : 'Star'}
                  >
                    {isStarred
                      ? <Star size={14} fill="currentColor" />
                      : <StarOff size={14} />}
                  </button>
                </button>
              );
            })
          )}
        </aside>

        {/* ── RIGHT: detail pane ──────────────────────────────────────────── */}
        <section className="nw-inbox__detail">
          {!selected ? (
            <div className="nw-inbox__placeholder">
              <MailOpen size={36} strokeWidth={1.2} />
              <p>Select a message to read it</p>
            </div>
          ) : (
            <article className="nw-detail">
              {/* Mobile back */}
              <button className="nw-detail__back" onClick={() => setSelected(null)}>
                ← Back to messages
              </button>

              <header className="nw-detail__head">
                <div className="nw-detail__from">
                  <div
                    className="nw-detail__avatar"
                    style={{ background: `hsl(${avatarHue(selected.name || selected.email || '')},45%,38%)` }}
                  >
                    {initials(selected.name)}
                  </div>
                  <div>
                    <div className="nw-detail__name">{selected.name || 'Unknown'}</div>
                    <a href={`mailto:${selected.email}`} className="nw-detail__email">
                      {selected.email}
                    </a>
                  </div>
                </div>
                <div className="nw-detail__meta">
                  <StatusBadge status={selected.status || 'UNREAD'} />
                  <span className="nw-detail__date">
                    {selected.createdAt
                      ? new Date(selected.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium', timeStyle: 'short',
                        })
                      : ''}
                  </span>
                </div>
              </header>

              <h3 className="nw-detail__subject">{selected.subject || '(no subject)'}</h3>
              <div className="nw-detail__body">{selected.message}</div>

              <footer className="nw-detail__actions">
                <button
                  className="nw-btn nw-btn--primary"
                  onClick={() => { setReply(''); setReplyErr(''); setModal('reply'); }}
                >
                  <Reply size={15} /> Reply
                </button>

                <button
                  className="nw-btn nw-btn--ghost"
                  onClick={() => toggleStar(selected)}
                  title={starred.has(selected.id) ? 'Unstar' : 'Star'}
                >
                  {starred.has(selected.id)
                    ? <><StarOff size={15} /> Unstar</>
                    : <><Star size={15} /> Star</>}
                </button>

                {selected.status !== 'READ' && (
                  <button
                    className="nw-btn nw-btn--ghost"
                    onClick={() => dispatch(updateMessageStatus({ id: selected.id, status: 'READ' }))}
                    disabled={actStatus === 'loading'}
                    title="Mark as read"
                  >
                    <CheckCheck size={15} /> Mark read
                  </button>
                )}

                {selected.status !== 'ARCHIVED' && (
                  <button
                    className="nw-btn nw-btn--ghost"
                    onClick={() => markArchive(selected)}
                    disabled={actStatus === 'loading'}
                  >
                    <Archive size={15} /> Archive
                  </button>
                )}

                <button
                  className="nw-btn nw-btn--danger"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => setModal('delete')}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </footer>
            </article>
          )}
        </section>
      </div>

      {/* ── Reply modal ──────────────────────────────────────────────────────── */}
      {modal === 'reply' && selected && (
        <Modal
          title={`Reply to ${selected.name || selected.email}`}
          onClose={() => setModal(null)}
          maxWidth={560}
          footer={
            <>
              <button className="nw-btn nw-btn--ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button
                className="nw-btn nw-btn--primary"
                onClick={sendReply}
                disabled={actStatus === 'loading'}
              >
                <Send size={14} /> Send reply
              </button>
            </>
          }
        >
          <div className="nw-field" style={{ marginBottom: 10 }}>
            <label className="nw-field__lbl">To</label>
            <input className="nw-input" value={selected.email || ''} readOnly
              style={{ opacity: 0.6, cursor: 'default' }} />
          </div>
          <div className="nw-field" style={{ marginBottom: 10 }}>
            <label className="nw-field__lbl">Subject</label>
            <input className="nw-input" value={`Re: ${selected.subject || ''}`} readOnly
              style={{ opacity: 0.6, cursor: 'default' }} />
          </div>
          <div className="nw-field">
            <label className="nw-field__lbl">Message <span className="req">*</span></label>
            <textarea
              className="nw-textarea"
              rows={6}
              placeholder="Write your reply…"
              value={reply}
              onChange={(e) => { setReply(e.target.value); if (replyErr) setReplyErr(''); }}
            />
            {replyErr && <span className="nw-field__err">{replyErr}</span>}
          </div>
          <p style={{ fontSize: 12, color: 'var(--nw-text-dim)', marginTop: 8 }}>
            This will open your default email client pre-filled with the reply.
          </p>
        </Modal>
      )}

      {/* ── Delete modal ─────────────────────────────────────────────────────── */}
      {modal === 'delete' && selected && (
        <Modal
          title="Delete message"
          onClose={() => setModal(null)}
          footer={
            <>
              <button
                className="nw-btn nw-btn--ghost"
                onClick={() => setModal(null)}
                disabled={actStatus === 'loading'}
              >
                Cancel
              </button>
              <button
                className="nw-btn nw-btn--danger"
                onClick={confirmDelete}
                disabled={actStatus === 'loading'}
              >
                {actStatus === 'loading' ? <span className="nw-spinner" /> : <Trash2 size={14} />}
                Delete
              </button>
            </>
          }
        >
          <p style={{ color: 'var(--nw-text-muted)', margin: 0 }}>
            Delete the message from{' '}
            <strong style={{ color: '#fff' }}>{selected.name || selected.email}</strong>?
            This action cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
};

export default AdminMessages;