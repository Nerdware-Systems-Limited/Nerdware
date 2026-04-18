import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Pencil, Trash2, Briefcase, ExternalLink } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import Modal from '../../components/admin/Modal';
import EmptyState from '../../components/admin/EmptyState';

import {
  fetchAllPortfolios, createPortfolio, updatePortfolio, deletePortfolio,
  selectAllPortfolios, selectPortfoliosStatus,
} from '../../redux/slices/portfolioSlice';

const EMPTY = {
  title: '', description: '', category: '',
  client: '', liveUrl: '', repoUrl: '', coverImage: '',
  technologies: '', featured: false,
};

const AdminPortfolio = () => {
  const dispatch = useDispatch();
  const items    = useSelector(selectAllPortfolios);
  const status   = useSelector(selectPortfoliosStatus);

  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => { dispatch(fetchAllPortfolios()); }, [dispatch]);

  const filtered = useMemo(() => items.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return [p.title, p.category, p.client].some((v) => v?.toLowerCase().includes(s));
  }), [items, search]);

  const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ type: 'create' }); };
  const openEdit = (p) => {
    setForm({
      title: p.title || '', description: p.description || '',
      category: p.category || '', client: p.client || '',
      liveUrl: p.liveUrl || '', repoUrl: p.repoUrl || '',
      coverImage: p.coverImage || '',
      technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || ''),
      featured: !!p.featured,
    });
    setErrors({}); setModal({ type: 'edit', data: p });
  };
  const openDel = (p) => setModal({ type: 'delete', data: p });

  const submit = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e); if (Object.keys(e).length) return;

    const payload = {
      ...form,
      technologies: form.technologies.split(',').map((t) => t.trim()).filter(Boolean),
    };
    if (modal.type === 'create') dispatch(createPortfolio(payload)).then(() => setModal(null));
    else dispatch(updatePortfolio({ id: modal.data.id, ...payload })).then(() => setModal(null));
  };

  const isLoading = status === 'loading' && !items.length;

  return (
    <>
      <PageHeader
        title="Portfolio"
        subtitle="Showcase work, case studies and featured projects."
        actions={
          <button className="nw-btn nw-btn--primary" onClick={openCreate}>
            <Plus size={16} /> New project
          </button>
        }
      />

      <div className="nw-table-wrap" style={{ marginBottom: 16 }}>
        <div className="nw-table-toolbar">
          <div className="nw-topbar__search nw-search-input" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Search size={16} color="rgba(255,255,255,0.5)" />
            <input
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="nw-empty"><span className="nw-spinner" /> Loading projects…</div>
      ) : !filtered.length ? (
        <EmptyState
          icon={Briefcase}
          title={search ? 'No matching projects' : 'No projects yet'}
          message={search ? 'Try a different search.' : 'Add your first portfolio project.'}
          action={!search && (
            <button className="nw-btn nw-btn--primary" onClick={openCreate}><Plus size={16}/> New project</button>
          )}
        />
      ) : (
        <div style={{
          display: 'grid', gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}>
          {filtered.map((p) => (
            <article key={p.id} className="nw-card" style={{ overflow: 'hidden' }}>
              <div style={{
                aspectRatio: '16/9', background: 'rgba(255,255,255,0.04)',
                position: 'relative',
              }}>
                {p.coverImage ? (
                  <img src={p.coverImage} alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <div style={{
                    display: 'grid', placeItems: 'center', height: '100%',
                    color: 'var(--nw-text-dim)',
                  }}><Briefcase size={28} /></div>
                )}
                {p.featured && (
                  <span className="nw-badge nw-badge--brand" style={{ position: 'absolute', top: 10, left: 10 }}>
                    Featured
                  </span>
                )}
              </div>
              <div style={{ padding: 16 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{p.title}</h3>
                <p style={{
                  margin: '6px 0 12px', color: 'var(--nw-text-muted)',
                  fontSize: 13, display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>{p.description}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {p.category && <span className="nw-badge nw-badge--info">{p.category}</span>}
                  {(p.technologies || []).slice(0, 3).map((t) => (
                    <span key={t} className="nw-badge nw-badge--muted">{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="nw-btn nw-btn--ghost nw-btn--sm" onClick={() => openEdit(p)}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button className="nw-btn nw-btn--danger nw-btn--sm" onClick={() => openDel(p)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noreferrer" className="nw-icon-btn" title="Open live">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {modal && (modal.type === 'create' || modal.type === 'edit') && (
        <Modal
          title={modal.type === 'create' ? 'New project' : `Edit ${modal.data.title}`}
          onClose={() => setModal(null)}
          maxWidth={680}
          footer={
            <>
              <button className="nw-btn nw-btn--ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="nw-btn nw-btn--primary" onClick={submit}>
                {modal.type === 'create' ? 'Create project' : 'Save changes'}
              </button>
            </>
          }
        >
          <div className="nw-grid-2">
            <div className="nw-field">
              <label className="nw-field__lbl">Title <span className="req">*</span></label>
              <input className="nw-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {errors.title && <span className="nw-field__err">{errors.title}</span>}
            </div>
            <div className="nw-field">
              <label className="nw-field__lbl">Category</label>
              <input className="nw-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Web app, Branding…" />
            </div>
          </div>
          <div className="nw-field">
            <label className="nw-field__lbl">Description <span className="req">*</span></label>
            <textarea className="nw-textarea" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {errors.description && <span className="nw-field__err">{errors.description}</span>}
          </div>
          <div className="nw-grid-2">
            <div className="nw-field">
              <label className="nw-field__lbl">Client</label>
              <input className="nw-input" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
            </div>
            <div className="nw-field">
              <label className="nw-field__lbl">Technologies</label>
              <input className="nw-input" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node, Postgres" />
            </div>
          </div>
          <div className="nw-grid-2">
            <div className="nw-field">
              <label className="nw-field__lbl">Live URL</label>
              <input className="nw-input" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} placeholder="https://…" />
            </div>
            <div className="nw-field">
              <label className="nw-field__lbl">Repository URL</label>
              <input className="nw-input" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} placeholder="https://github.com/…" />
            </div>
          </div>
          <div className="nw-field">
            <label className="nw-field__lbl">Cover image URL</label>
            <input className="nw-input" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://…" />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--nw-text-muted)', fontSize: 14 }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Mark as featured
          </label>
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal
          title="Delete project"
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="nw-btn nw-btn--ghost" onClick={() => setModal(null)}>Cancel</button>
              <button
                className="nw-btn nw-btn--danger"
                onClick={() => { dispatch(deletePortfolio(modal.data.id)); setModal(null); }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          }
        >
          <p style={{ margin: 0, color: 'var(--nw-text-muted)' }}>
            Delete <strong style={{ color: '#fff' }}>“{modal.data.title}”</strong>? This cannot be undone.
          </p>
        </Modal>
      )}
    </>
  );
};

export default AdminPortfolio;
