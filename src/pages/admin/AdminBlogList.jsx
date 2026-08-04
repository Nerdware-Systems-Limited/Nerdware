import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import EmptyState from '../../components/admin/EmptyState';

import {
  fetchBlogs, deleteBlog,
  selectAllBlogs, selectBlogsStatus, selectBlogsPagination,
  selectMutationStatus, selectMutationError,
  clearMutationState,
} from '../../redux/slices/Blogslice';

const STATUS_TABS = ['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'];
const LIMIT = 10;

const formatDate = (s) =>
  s ? new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const AdminBlogList = () => {
  const dispatch       = useDispatch();
  const posts          = useSelector(selectAllBlogs);
  const status         = useSelector(selectBlogsStatus);
  const pagination     = useSelector(selectBlogsPagination);
  const mutationStatus = useSelector(selectMutationStatus);
  const mutationError  = useSelector(selectMutationError);

  const [tab, setTab]           = useState('ALL');
  const [search, setSearch]     = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]         = useState(1);
  const [toDelete, setToDelete] = useState(null);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  // Any filter change goes back to page 1.
  useEffect(() => { setPage(1); }, [tab, debouncedSearch]);

  // Status/search/pagination are all handled server-side so drafts and
  // archived posts (invisible without the admin auth header) and pages
  // beyond the first actually load.
  useEffect(() => {
    dispatch(fetchBlogs({ page, limit: LIMIT, status: tab, search: debouncedSearch || undefined }));
  }, [dispatch, page, tab, debouncedSearch]);

  useEffect(() => {
    if (mutationStatus === 'succeeded') {
      setToDelete(null);
      dispatch(clearMutationState());
      // Re-fetch so the list and pagination totals reflect the deletion.
      dispatch(fetchBlogs({ page, limit: LIMIT, status: tab, search: debouncedSearch || undefined }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutationStatus, dispatch]);

  // Deleting the last post on a page leaves it empty — step back a page.
  useEffect(() => {
    if (status === 'succeeded' && posts.length === 0 && page > 1) {
      setPage((p) => p - 1);
    }
  }, [status, posts.length, page]);

  const isLoading = status === 'loading';

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
            {tab === t && (
              <span style={{
                padding: '0 7px', borderRadius: 999,
                background: 'rgba(0,0,0,0.25)', fontSize: 11,
              }}>{pagination.total}</span>
            )}
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
        ) : !posts.length ? (
          <EmptyState
            icon={FileText}
            title={search || tab !== 'ALL' ? 'No matching posts' : 'No posts yet'}
            message={search || tab !== 'ALL' ? 'Try a different search or filter.' : 'Write your first post to get started.'}
            action={!search && tab === 'ALL' && (
              <Link to="/admin/blog/new" className="nw-btn nw-btn--primary"><Plus size={16}/> New post</Link>
            )}
          />
        ) : (
          <>
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
              {posts.map((p) => (
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
                      <Link to={`/admin/blog/edit/${p.slug}`} className="nw-icon-btn" title="Edit">
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

          {pagination.pages > 1 && (
            <div className="nw-pagination">
              <span className="nw-pagination__status">
                Page {pagination.page} of {pagination.pages} · {pagination.total} posts
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
          </>
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
