import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import {
  fetchBlogBySlug, createBlog, updateBlog,
  clearCurrentPost, clearMutationState,
  selectCurrentPost, selectDetailStatus,
  selectMutationStatus, selectMutationError,
} from '../../redux/slices/Blogslice';

const EMPTY = {
  title: '', excerpt: '', content: '',
  category: '', status: 'DRAFT', readTime: '',
  tags: '', coverImage: '',
};

const Field = ({ label, required, hint, error, children }) => (
  <div className="nw-field">
    <label className="nw-field__lbl">
      {label} {required && <span className="req">*</span>}
    </label>
    {children}
    {hint && !error && <p className="nw-field__hint">{hint}</p>}
    {error && <span className="nw-field__err">{error}</span>}
  </div>
);

const AdminBlogForm = () => {
  const { id }      = useParams();
  const isEdit      = Boolean(id);
  const navigate    = useNavigate();
  const dispatch    = useDispatch();
  const post        = useSelector(selectCurrentPost);
  const detailStat  = useSelector(selectDetailStatus);
  const mutStat     = useSelector(selectMutationStatus);
  const mutErr      = useSelector(selectMutationError);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) dispatch(fetchBlogBySlug(id));
    return () => { dispatch(clearCurrentPost()); dispatch(clearMutationState()); };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && post) {
      setForm({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || '',
        status: post.status || 'DRAFT',
        readTime: post.readTime || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
        coverImage: post.coverImage || '',
      });
    }
  }, [isEdit, post]);

  useEffect(() => {
    if (mutStat === 'succeeded') {
      dispatch(clearMutationState());
      navigate('/admin/blog');
    }
  }, [mutStat, navigate, dispatch]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title = 'Title is required';
    if (!form.excerpt.trim()) e.excerpt = 'Excerpt is required';
    if (!form.content.trim()) e.content = 'Content is required';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const v = validate(); setErrors(v);
    if (Object.keys(v).length) return;
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    if (isEdit) dispatch(updateBlog({ id: post.id, ...payload }));
    else dispatch(createBlog(payload));
  };

  const isSaving = mutStat === 'loading';

  if (isEdit && detailStat === 'loading') {
    return (
      <div className="nw-empty">
        <span className="nw-spinner" /> <span style={{ marginLeft: 10 }}>Loading post…</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <PageHeader
        title={isEdit ? 'Edit post' : 'New post'}
        subtitle={isEdit ? `Editing “${post?.title || ''}”` : 'Craft a new article for the Nerdware blog.'}
        actions={
          <>
            <Link to="/admin/blog" className="nw-btn nw-btn--ghost">
              <ArrowLeft size={16} /> Back
            </Link>
            {isEdit && post?.status === 'PUBLISHED' && (
              <Link to={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="nw-btn nw-btn--ghost">
                <Eye size={16} /> Preview
              </Link>
            )}
            <button type="submit" className="nw-btn nw-btn--primary" disabled={isSaving}>
              {isSaving ? <span className="nw-spinner" /> : <Save size={16} />}
              {isEdit ? 'Save changes' : 'Create post'}
            </button>
          </>
        }
      />

      {mutErr && (
        <div className="nw-card" style={{ borderColor: 'rgba(239,68,68,0.4)', marginBottom: 16 }}>
          <div className="nw-card__bd" style={{ color: '#fca5a5' }}>{mutErr}</div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
        {/* Main column */}
        <div className="nw-card">
          <div className="nw-card__hd"><h3>Content</h3></div>
          <div className="nw-card__bd">
            <Field label="Title" required error={errors.title}>
              <input className="nw-input" value={form.title} onChange={set('title')} placeholder="A great headline…" />
            </Field>
            <Field label="Excerpt" required hint="Short summary shown in listings & previews." error={errors.excerpt}>
              <textarea className="nw-textarea" rows={3} value={form.excerpt} onChange={set('excerpt')} placeholder="One or two sentences…" />
            </Field>
            <Field label="Content" required hint="Markdown supported." error={errors.content}>
              <textarea className="nw-textarea" rows={16} value={form.content} onChange={set('content')} placeholder="Write your article…" />
            </Field>
          </div>
        </div>

        {/* Side column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="nw-card">
            <div className="nw-card__hd"><h3>Publishing</h3></div>
            <div className="nw-card__bd">
              <Field label="Status">
                <select className="nw-select" value={form.status} onChange={set('status')}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </Field>
              <Field label="Category">
                <input className="nw-input" value={form.category} onChange={set('category')} placeholder="e.g. Engineering" />
              </Field>
              <Field label="Tags" hint="Comma separated">
                <input className="nw-input" value={form.tags} onChange={set('tags')} placeholder="react, ai, devops" />
              </Field>
              <Field label="Read time" hint="e.g. 5 min read">
                <input className="nw-input" value={form.readTime} onChange={set('readTime')} placeholder="5 min read" />
              </Field>
            </div>
          </div>

          <div className="nw-card">
            <div className="nw-card__hd"><h3>Cover image</h3></div>
            <div className="nw-card__bd">
              <Field label="Image URL">
                <input className="nw-input" value={form.coverImage} onChange={set('coverImage')} placeholder="https://…" />
              </Field>
              {form.coverImage && (
                <div style={{
                  marginTop: 10, borderRadius: 12, overflow: 'hidden',
                  border: '1px solid var(--nw-border)', aspectRatio: '16/9',
                  background: 'rgba(255,255,255,0.04)',
                }}>
                  <img
                    src={form.coverImage}
                    alt="Cover preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AdminBlogForm;
