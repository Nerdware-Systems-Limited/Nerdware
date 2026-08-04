import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Pencil, Trash2, MessageSquare, Star, ChevronLeft, ChevronRight } from 'lucide-react';

import PageHeader    from '../../components/admin/PageHeader';
import Modal         from '../../components/admin/Modal';
import EmptyState    from '../../components/admin/EmptyState';
import StatusBadge   from '../../components/admin/StatusBadge';

import {
  fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  selectAllTestimonials, selectTestimonialsStatus, selectTestimonialsPagination,
  selectMutationStatus, clearMutationState,
} from '../../redux/slices/testimonialSlice';

const LIMIT = 20;
const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

/* ─── Constants ─────────────────────────────────────────────────────────── */

// Field names here match the backend (Testimonial model): name, feedback,
// image — NOT author/content/avatarUrl. Getting these wrong means the API's
// express-validator rejects create (name/feedback required) and silently
// ignores those three fields on update.
const EMPTY = {
  name:     '',
  role:     '',
  company:  '',
  feedback: '',
  rating:   5,
  image:    '',
  featured: false,
  // POST /api/testimonials always lands PENDING regardless of this value —
  // submit() follows up with a PATCH-equivalent update when it isn't PENDING.
  status:   'APPROVED',
};

const MAX_RATING = 5;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Render filled / empty stars */
const Stars = ({ rating = 0 }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {Array.from({ length: MAX_RATING }, (_, i) => (
      <Star
        key={i}
        size={13}
        fill={i < rating ? 'var(--nw-brand)' : 'none'}
        color={i < rating ? 'var(--nw-brand)' : 'rgba(255,255,255,0.2)'}
      />
    ))}
  </div>
);

/** Clickable star row used inside the form */
const StarPicker = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {Array.from({ length: MAX_RATING }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i + 1)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
        aria-label={`Rate ${i + 1} star${i !== 0 ? 's' : ''}`}
      >
        <Star
          size={20}
          fill={i < value ? 'var(--nw-brand)' : 'none'}
          color={i < value ? 'var(--nw-brand)' : 'rgba(255,255,255,0.3)'}
        />
      </button>
    ))}
  </div>
);

/** Fallback avatar with initials */
const Avatar = ({ src, name, size = 44 }) => {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return src ? (
    <img
      src={src}
      alt={name}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0,
        border: '2px solid rgba(255,255,255,0.08)',
      }}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(255,255,255,0.07)',
      border: '2px solid rgba(255,255,255,0.08)',
      display: 'grid', placeItems: 'center',
      fontSize: size * 0.35, fontWeight: 700,
      color: 'var(--nw-text-muted)',
    }}>
      {initials}
    </div>
  );
};

/* ─── Component ─────────────────────────────────────────────────────────── */

const AdminTestimonial = () => {
  const dispatch       = useDispatch();
  const items          = useSelector(selectAllTestimonials);
  const status         = useSelector(selectTestimonialsStatus);
  const pagination     = useSelector(selectTestimonialsPagination);
  const mutationStatus = useSelector(selectMutationStatus);

  const [tab,    setTab]    = useState('ALL');
  const [search, setSearch] = useState('');
  const [page,   setPage]   = useState(1);
  const [modal,  setModal]  = useState(null);   // null | { type: 'create'|'edit'|'delete', data? }
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => { setPage(1); }, [tab]);

  /* Fetch on mount / page / tab change */
  useEffect(() => {
    dispatch(fetchTestimonials({ page, limit: LIMIT, status: tab }));
  }, [dispatch, page, tab]);

  /* Close modal automatically after a successful mutation */
  useEffect(() => {
    if (mutationStatus === 'succeeded') {
      setModal(null);
      dispatch(clearMutationState());
    }
  }, [mutationStatus, dispatch]);

  /* Filtered list — the backend doesn't support free-text search on this
     endpoint, so this only filters within the current page; pagination
     itself is still driven server-side. */
  const filtered = useMemo(() => items.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return [t.name, t.role, t.company, t.feedback].some((v) => v?.toLowerCase().includes(s));
  }), [items, search]);

  /* Modal openers */
  const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ type: 'create' }); };
  const openEdit   = (t) => {
    setForm({
      name:     t.name     || '',
      role:     t.role     || '',
      company:  t.company  || '',
      feedback: t.feedback || '',
      rating:   t.rating   ?? 5,
      image:    t.image    || '',
      featured: !!t.featured,
      status:   t.status   || 'APPROVED',
    });
    setErrors({});
    setModal({ type: 'edit', data: t });
  };
  const openDel = (t) => setModal({ type: 'delete', data: t });

  /* Form field helper */
  const field = (key) => ({
    value:    form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });

  /* Submit (create / update) */
  const submit = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Author name is required';
    if (!form.feedback.trim()) e.feedback = 'Testimonial content is required';
    setErrors(e);
    if (Object.keys(e).length) return;

    const { status, ...rest } = form;
    const payload = { ...rest, rating: Number(form.rating) };
    // The API validates `image` as an optional URL, but express-validator's
    // .optional() only skips an absent field — an empty string still fails
    // isURL(), so drop it entirely rather than sending ''.
    if (!payload.image) delete payload.image;

    if (modal.type === 'edit') {
      dispatch(updateTestimonial({ id: modal.data.id, ...payload, status }));
      return;
    }

    // POST /api/testimonials always creates as PENDING/unfeatured regardless
    // of what's sent — if the admin picked a different status here, follow
    // up with an update so "New testimonial" behaves as a single action
    // instead of silently landing in the moderation queue.
    dispatch(createTestimonial(payload)).then((action) => {
      const created = action.payload;
      if (created?.id && (status !== 'PENDING' || form.featured)) {
        dispatch(updateTestimonial({ id: created.id, status, featured: form.featured }));
      }
    });
  };

  const isMutating = mutationStatus === 'loading';
  const isLoading  = status === 'loading';

  return (
    <>
      <PageHeader
        title="Testimonials"
        subtitle="Manage client reviews and social proof displayed on your site."
        actions={
          <button className="nw-btn nw-btn--primary" onClick={openCreate}>
            <Plus size={16} /> New testimonial
          </button>
        }
      />

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`nw-btn nw-btn--sm ${tab === t ? 'nw-btn--primary' : 'nw-btn--ghost'}`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
            {tab === t && (
              <span style={{
                padding: '0 7px', borderRadius: 999,
                background: 'rgba(0,0,0,0.25)', fontSize: 11,
              }}>{pagination.total}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search toolbar */}
      <div className="nw-table-wrap" style={{ marginBottom: 16 }}>
        <div className="nw-table-toolbar">
          <div
            className="nw-topbar__search nw-search-input"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <Search size={16} color="rgba(255,255,255,0.5)" />
            <input
              placeholder="Search testimonials…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="nw-empty">
          <span className="nw-spinner" /> Loading testimonials…
        </div>
      ) : !filtered.length ? (
        <EmptyState
          icon={MessageSquare}
          title={search || tab !== 'ALL' ? 'No matching testimonials' : 'No testimonials yet'}
          message={search || tab !== 'ALL' ? 'Try a different search or filter.' : 'Add your first client testimonial.'}
          action={!search && tab === 'ALL' && (
            <button className="nw-btn nw-btn--primary" onClick={openCreate}>
              <Plus size={16} /> New testimonial
            </button>
          )}
        />
      ) : (
        <div style={{
          display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}>
          {filtered.map((t) => (
            <article key={t.id} className="nw-card" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 20 }}>
              {/* Quote body */}
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: 6, position: 'absolute', top: 0, right: 0 }}>
                  {t.featured && <span className="nw-badge nw-badge--brand">Featured</span>}
                  {t.status !== 'APPROVED' && <StatusBadge status={t.status} />}
                </div>
                <p style={{
                  margin: 0,
                  color: 'var(--nw-text-muted)',
                  fontSize: 13,
                  lineHeight: 1.65,
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  "{t.feedback}"
                </p>
              </div>

              {/* Stars */}
              {t.rating > 0 && <Stars rating={t.rating} />}

              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                <Avatar src={t.image} name={t.name} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{t.name}</div>
                  {(t.role || t.company) && (
                    <div style={{ color: 'var(--nw-text-muted)', fontSize: 12 }}>
                      {[t.role, t.company].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button className="nw-btn nw-btn--ghost nw-btn--sm" onClick={() => openEdit(t)}>
                  <Pencil size={13} /> Edit
                </button>
                <button className="nw-btn nw-btn--danger nw-btn--sm" onClick={() => openDel(t)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && pagination.pages > 1 && (
        <div className="nw-pagination" style={{ border: 'none', marginTop: 16, padding: '14px 0 0' }}>
          <span className="nw-pagination__status">
            Page {pagination.page} of {pagination.pages} · {pagination.total} testimonials
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="nw-btn nw-btn--ghost nw-btn--sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <button
              type="button"
              className="nw-btn nw-btn--ghost nw-btn--sm"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={pagination.page >= pagination.pages}
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* ── Create / Edit modal ── */}
      {modal && (modal.type === 'create' || modal.type === 'edit') && (
        <Modal
          title={modal.type === 'create' ? 'New testimonial' : `Edit: ${modal.data.name}`}
          onClose={() => setModal(null)}
          maxWidth={640}
          footer={
            <>
              <button className="nw-btn nw-btn--ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button
                className="nw-btn nw-btn--primary"
                onClick={submit}
                disabled={isMutating}
              >
                {isMutating
                  ? 'Saving…'
                  : modal.type === 'create' ? 'Create testimonial' : 'Save changes'}
              </button>
            </>
          }
        >
          {/* Row 1: author + role */}
          <div className="nw-grid-2">
            <div className="nw-field">
              <label className="nw-field__lbl">Author <span className="req">*</span></label>
              <input className="nw-input" placeholder="Jane Smith" {...field('name')} />
              {errors.name && <span className="nw-field__err">{errors.name}</span>}
            </div>
            <div className="nw-field">
              <label className="nw-field__lbl">Role / Title</label>
              <input className="nw-input" placeholder="Head of Product" {...field('role')} />
            </div>
          </div>

          {/* Row 2: company + avatar */}
          <div className="nw-grid-2">
            <div className="nw-field">
              <label className="nw-field__lbl">Company</label>
              <input className="nw-input" placeholder="Acme Corp" {...field('company')} />
            </div>
            <div className="nw-field">
              <label className="nw-field__lbl">Avatar URL</label>
              <input className="nw-input" placeholder="https://…" {...field('image')} />
            </div>
          </div>

          {/* Content */}
          <div className="nw-field">
            <label className="nw-field__lbl">Testimonial <span className="req">*</span></label>
            <textarea
              className="nw-textarea"
              rows={4}
              placeholder="What did they say about your work?"
              {...field('feedback')}
            />
            {errors.feedback && <span className="nw-field__err">{errors.feedback}</span>}
          </div>

          {/* Rating + status */}
          <div className="nw-grid-2">
            <div className="nw-field">
              <label className="nw-field__lbl">Rating</label>
              <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
            </div>
            <div className="nw-field">
              <label className="nw-field__lbl">Status</label>
              <select className="nw-select" {...field('status')}>
                <option value="APPROVED">Approved (visible on site)</option>
                <option value="PENDING">Pending review</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Featured toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--nw-text-muted)', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Mark as featured
          </label>
        </Modal>
      )}

      {/* ── Delete modal ── */}
      {modal?.type === 'delete' && (
        <Modal
          title="Delete testimonial"
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="nw-btn nw-btn--ghost" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button
                className="nw-btn nw-btn--danger"
                disabled={isMutating}
                onClick={() => dispatch(deleteTestimonial(modal.data.id))}
              >
                <Trash2 size={14} /> {isMutating ? 'Deleting…' : 'Delete'}
              </button>
            </>
          }
        >
          <p style={{ margin: 0, color: 'var(--nw-text-muted)' }}>
            Delete testimonial from{' '}
            <strong style={{ color: '#fff' }}>"{modal.data.name}"</strong>? This cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
};

export default AdminTestimonial;