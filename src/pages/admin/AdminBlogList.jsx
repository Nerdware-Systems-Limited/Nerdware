import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye, FileText } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import EmptyState from '../../components/admin/EmptyState';

import {
  fetchBlogs, deleteBlog,
  selectAllBlogs, selectBlogsStatus,
  selectMutationStatus, selectMutationError,
  clearMutationState,
} from '../../redux/slices/Blogslice';

const STATUS_TABS = ['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'];

const formatDate = (s) =>
  s ? new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const AdminBlogList = () => {
  const dispatch       = useDispatch();
  const posts          = useSelector(selectAllBlogs);
  const status         = useSelector(selectBlogsStatus);
  const mutationStatus = useSelector(selectMutationStatus);
  const mutationError  = useSelector(selectMutationError);

  const [tab, setTab]           = useState('ALL');
  const [search, setSearch]     = useState('');
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => { if (status === 'idle') dispatch(fetchBlogs()); }, [dispatch, status]);
  useEffect(() => {
    if (mutationStatus === 'succeeded') {
      setToDelete(null);
      dispatch(clearMutationState());
    }
  }, [mutationStatus, dispatch]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (tab !== 'ALL' && p.status !== tab) return false;
      if (search) {
        const s = search.toLowerCase();
        return [p.title, p.category, p.author?.name].some((v) => v?.toLowerCase().includes(s));
      }
      return true;
    });
  }, [posts, tab, search]);

  const counts = STATUS_TABS.reduce((acc, t) => {
    acc[t] = t === 'ALL' ? posts.length : posts.filter((p) => p.status === t).length;
    return acc;
  }, {});

  const isLoading = status === 'loading' && !posts.length;

  return (
    <>
      <PageHeader
        title="Blog posts"
        subtitle="Create, edit and publish content for your audience."
        actions={
          <Link to="/admin/blog/new" className="nw-btn nw-btn--primary">
            <Plus size={16} /> New post
          </Link>
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`nw-btn nw-btn--sm ${tab === t ? 'nw-btn--primary' : 'nw-btn--ghost'}`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
            <span style={{
              padding: '0 7px', borderRadius: 999,
              background: 'rgba(0,0,0,0.25)', fontSize: 11,
            }}>{counts[t]}</span>
          </button>
        ))}
      </div>

      <div className="nw-table-wrap">
        <div className="nw-table-toolbar">
          <div className="nw-topbar__search nw-search-input" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Search size={16} color="rgba(255,255,255,0.5)" />
            <input
              placeholder="Search by title, category or author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="nw-empty"><span className="nw-spinner" /> <span style={{ marginLeft: 10 }}>Loading posts…</span></div>
        ) : !filtered.length ? (
          <EmptyState
            icon={FileText}
            title={search || tab !== 'ALL' ? 'No matching posts' : 'No posts yet'}
            message={search || tab !== 'ALL' ? 'Try a different search or filter.' : 'Write your first post to get started.'}
            action={!search && tab === 'ALL' && (
              <Link to="/admin/blog/new" className="nw-btn nw-btn--primary"><Plus size={16}/> New post</Link>
            )}
          />
        ) : (
          <table className="nw-table">
            <thead>
              <tr>
                <th style={{ minWidth: 280 }}>Title</th>
                <th>Status</th>
                <th>Category</th>
                <th>Author</th>
                <th>Updated</th>
                <th style={{ width: 1, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="nw-row-title">{p.title}</div>
                    <div className="nw-row-sub">/{p.slug}</div>
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ color: 'var(--nw-text-muted)' }}>{p.category || '—'}</td>
                  <td style={{ color: 'var(--nw-text-muted)' }}>{p.author?.name || '—'}</td>
                  <td style={{ color: 'var(--nw-text-muted)' }}>{formatDate(p.updatedAt || p.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {p.status === 'PUBLISHED' && (
                        <Link to={`/blog/${p.slug}`} className="nw-icon-btn" title="View" target="_blank" rel="noreferrer">
                          <Eye size={15} />
                        </Link>
                      )}
                      <Link to={`/admin/blog/edit/${p.id}`} className="nw-icon-btn" title="Edit">
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        className="nw-icon-btn"
                        title="Delete"
                        onClick={() => setToDelete(p)}
                        style={{ color: '#fca5a5' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toDelete && (
        <Modal
          title="Delete post"
          onClose={() => setToDelete(null)}
          footer={
            <>
              <button
                className="nw-btn nw-btn--ghost"
                onClick={() => setToDelete(null)}
                disabled={mutationStatus === 'loading'}
              >Cancel</button>
              <button
                className="nw-btn nw-btn--danger"
                onClick={() => dispatch(deleteBlog(toDelete.id))}
                disabled={mutationStatus === 'loading'}
              >
                {mutationStatus === 'loading' ? <span className="nw-spinner" /> : <Trash2 size={14} />}
                Delete
              </button>
            </>
          }
        >
          <p style={{ color: 'var(--nw-text-muted)', margin: 0 }}>
            Are you sure you want to delete <strong style={{ color: '#fff' }}>“{toDelete.title}”</strong>?
            This action cannot be undone.
          </p>
          {mutationError && (
            <p style={{ color: '#fca5a5', marginTop: 12, fontSize: 13 }}>{mutationError}</p>
          )}
        </Modal>
      )}
    </>
  );
};

export default AdminBlogList;
