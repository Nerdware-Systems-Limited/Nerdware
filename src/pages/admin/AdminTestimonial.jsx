import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Pencil, Trash2, MessageSquare, Star } from 'lucide-react';

import PageHeader    from '../../components/admin/PageHeader';
import Modal         from '../../components/admin/Modal';
import EmptyState    from '../../components/admin/EmptyState';

import {
  fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  selectAllTestimonials, selectTestimonialsStatus,
  selectMutationStatus, clearMutationState,
} from '../../redux/slices/testimonialSlice';

/* ─── Constants ─────────────────────────────────────────────────────────── */

const EMPTY = {
  author:     '',
  role:       '',
  company:    '',
  content:    '',
  rating:     5,
  avatarUrl:  '',
  featured:   false,
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
  const mutationStatus = useSelector(selectMutationStatus);

  const [search, setSearch] = useState('');
  const [modal,  setModal]  = useState(null);   // null | { type: 'create'|'edit'|'delete', data? }
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});

  /* Initial fetch */
  useEffect(() => { dispatch(fetchTestimonials()); }, [dispatch]);

  /* Close modal automatically after a successful mutation */
  useEffect(() => {
    if (mutationStatus === 'succeeded') {
      setModal(null);
      dispatch(clearMutationState());
    }
  }, [mutationStatus, dispatch]);

  /* Filtered list */
  const filtered = useMemo(() => items.filter((t) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return [t.author, t.role, t.company, t.content].some((v) => v?.toLowerCase().includes(s));
  }), [items, search]);

  /* Modal openers */
  const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ type: 'create' }); };
  const openEdit   = (t) => {
    setForm({
      author:    t.author    || '',
      role:      t.role      || '',
      company:   t.company   || '',
      content:   t.content   || '',
      rating:    t.rating    ?? 5,
      avatarUrl: t.avatarUrl || '',
      featured:  !!t.featured,
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
    if (!form.author.trim())  e.author  = 'Author name is required';
    if (!form.content.trim()) e.content = 'Testimonial content is required';
    setErrors(e);
    if (Object.keys(e).length) return;

    const payload = { ...form, rating: Number(form.rating) };
    if (modal.type === 'create') {
      dispatch(createTestimonial(payload));
    } else {
      dispatch(updateTestimonial({ id: modal.data.id, ...payload }));
    }
  };

  const isMutating = mutationStatus === 'loading';
  const isLoading  = status === 'loading' && !items.length;

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
          title={search ? 'No matching testimonials' : 'No testimonials yet'}
          message={search ? 'Try a different search.' : 'Add your first client testimonial.'}
          action={!search && (
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
                {t.featured && (
                  <span
                    className="nw-badge nw-badge--brand"
                    style={{ position: 'absolute', top: 0, right: 0 }}
                  >
                    Featured
                  </span>
                )}
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
                  "{t.content}"
                </p>
              </div>

              {/* Stars */}
              {t.rating > 0 && <Stars rating={t.rating} />}

              {/* Author row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
                <Avatar src={t.avatarUrl} name={t.author} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{t.author}</div>
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

      {/* ── Create / Edit modal ── */}
      {modal && (modal.type === 'create' || modal.type === 'edit') && (
        <Modal
          title={modal.type === 'create' ? 'New testimonial' : `Edit — ${modal.data.author}`}
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
              <input className="nw-input" placeholder="Jane Smith" {...field('author')} />
              {errors.author && <span className="nw-field__err">{errors.author}</span>}
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
              <input className="nw-input" placeholder="https://…" {...field('avatarUrl')} />
            </div>
          </div>

          {/* Content */}
          <div className="nw-field">
            <label className="nw-field__lbl">Testimonial <span className="req">*</span></label>
            <textarea
              className="nw-textarea"
              rows={4}
              placeholder="What did they say about your work?"
              {...field('content')}
            />
            {errors.content && <span className="nw-field__err">{errors.content}</span>}
          </div>

          {/* Rating */}
          <div className="nw-field">
            <label className="nw-field__lbl">Rating</label>
            <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
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
            <strong style={{ color: '#fff' }}>"{modal.data.author}"</strong>? This cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
};

export default AdminTestimonial;