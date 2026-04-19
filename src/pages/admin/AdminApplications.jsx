import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Trash2, Briefcase, Eye, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, AlertCircle,
} from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import EmptyState from '../../components/admin/EmptyState';

import {
  fetchAllApplications, fetchApplicationById,
  updateApplicationStatus, deleteApplication,
  selectAllApplications, selectSelectedApplication,
  selectApplicationsStatus, selectApplicationsError,
  selectApplicationsPagination,
  selectAppActionStatus, selectAppActionError,
  clearActionState, clearSelectedApplication,
  setSelectedApplication,
} from '../../redux/slices/applicationsSlice';

const STATUS_TABS = ['ALL', 'PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'];

const formatDate = (s) =>
  s
    ? new Date(s).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '—';

const statusIcon = (s) => {
  switch (s) {
    case 'ACCEPTED':  return <CheckCircle  size={14} color="#4ade80" />;
    case 'REJECTED':  return <XCircle      size={14} color="#fca5a5" />;
    case 'REVIEWING': return <AlertCircle  size={14} color="#fbbf24" />;
    default:          return <Clock        size={14} color="#94a3b8" />;
  }
};

const AdminApplications = () => {
  const dispatch    = useDispatch();
  const applications = useSelector(selectAllApplications);
  const selected    = useSelector(selectSelectedApplication);
  const status      = useSelector(selectApplicationsStatus);
  const error       = useSelector(selectApplicationsError);
  const pagination  = useSelector(selectApplicationsPagination);
  const actStatus   = useSelector(selectAppActionStatus);
  const actError    = useSelector(selectAppActionError);

  const [tab, setTab]           = useState('ALL');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState(null); // 'view' | 'status' | 'delete'
  const [statusForm, setStatusForm] = useState({ status: '', notes: '' });

  /* ── Fetch on mount / tab change ──────────────────────────────────────── */
  useEffect(() => {
    const params = { page, limit: 10 };
    if (tab !== 'ALL') params.status = tab;
    if (search)        params.search = search;
    dispatch(fetchAllApplications(params));
  }, [dispatch, tab, page]);

  /* ── Debounced search re-fetch ────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      const params = { page: 1, limit: 10 };
      if (tab !== 'ALL') params.status = tab;
      if (search)        params.search = search;
      dispatch(fetchAllApplications(params));
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Close modals on success ──────────────────────────────────────────── */
  useEffect(() => {
    if (actStatus === 'succeeded') {
      setModal(null);
      dispatch(clearActionState());
    }
  }, [actStatus, dispatch]);

  /* ── Open view modal ──────────────────────────────────────────────────── */
  const openView = (app) => {
    dispatch(fetchApplicationById(app.id));
    setModal('view');
  };

  /* ── Open status modal ────────────────────────────────────────────────── */
  const openStatus = (app) => {
    dispatch(setSelectedApplication(app));
    setStatusForm({ status: app.status || 'PENDING', notes: app.notes || '' });
    setModal('status');
  };

  /* ── Open delete modal ────────────────────────────────────────────────── */
  const openDelete = (app) => {
    dispatch(setSelectedApplication(app));
    setModal('delete');
  };

  const closeModal = () => {
    setModal(null);
    dispatch(clearSelectedApplication());
    dispatch(clearActionState());
  };

  const submitStatus = () => {
    if (!statusForm.status || !selected) return;
    dispatch(updateApplicationStatus({ id: selected.id, ...statusForm }));
  };

  const confirmDelete = () => {
    if (!selected) return;
    dispatch(deleteApplication(selected.id));
  };

  const isLoading = status === 'loading' && !applications.length;

  /* ── Tab counts (from current page data; server-side pagination means
        counts are approximate for non-ALL tabs) ──────────────────────────── */
  const counts = useMemo(() =>
    STATUS_TABS.reduce((acc, t) => {
      acc[t] = t === 'ALL'
        ? pagination.total
        : applications.filter((a) => a.status === t).length;
      return acc;
    }, {}),
  [applications, pagination.total]);

  return (
    <>
      <PageHeader
        title="Applications"
        subtitle="Review and manage job or project applications."
      />

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setPage(1); }}
            className={`nw-btn nw-btn--sm ${tab === t ? 'nw-btn--primary' : 'nw-btn--ghost'}`}
          >
            {t.charAt(0) + t.slice(1).toLowerCase()}
            {t === 'ALL' && (
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
              placeholder="Search by name, email or position…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="nw-empty">
            <span className="nw-spinner" />
            <span style={{ marginLeft: 10 }}>Loading applications…</span>
          </div>
        ) : error ? (
          <div className="nw-empty" style={{ color: '#fca5a5' }}>{error}</div>
        ) : !applications.length ? (
          <EmptyState
            icon={Briefcase}
            title={search || tab !== 'ALL' ? 'No matching applications' : 'No applications yet'}
            message={
              search || tab !== 'ALL'
                ? 'Try a different search or filter.'
                : 'Applications submitted via your site will appear here.'
            }
          />
        ) : (
          <table className="nw-table">
            <thead>
              <tr>
                <th style={{ minWidth: 220 }}>Applicant</th>
                <th>Position</th>
                <th>Status</th>
                <th>Submitted</th>
                <th style={{ width: 1, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="nw-row-title">{app.name || app.fullName || '—'}</div>
                    <div className="nw-row-sub">{app.email || '—'}</div>
                  </td>
                  <td style={{ color: 'var(--nw-text-muted)' }}>
                    {app.position || app.role || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {statusIcon(app.status)}
                      <StatusBadge status={app.status || 'PENDING'} />
                    </div>
                  </td>
                  <td style={{ color: 'var(--nw-text-muted)' }}>
                    {formatDate(app.createdAt)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="nw-icon-btn"
                        title="View details"
                        onClick={() => openView(app)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="nw-icon-btn"
                        title="Update status"
                        onClick={() => openStatus(app)}
                      >
                        <CheckCircle size={15} />
                      </button>
                      <button
                        type="button"
                        className="nw-icon-btn"
                        title="Delete"
                        onClick={() => openDelete(app)}
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderTop: '1px solid var(--nw-border, rgba(255,255,255,0.07))',
            fontSize: 13, color: 'var(--nw-text-muted)',
          }}>
            <span>
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="nw-btn nw-btn--ghost nw-btn--sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft size={15} /> Prev
              </button>
              <button
                className="nw-btn nw-btn--ghost nw-btn--sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── View modal ──────────────────────────────────────────────────────── */}
      {modal === 'view' && (
        <Modal
          title="Application details"
          onClose={closeModal}
          maxWidth={600}
          footer={
            <>
              <button className="nw-btn nw-btn--ghost" onClick={closeModal}>Close</button>
              {selected && (
                <button
                  className="nw-btn nw-btn--primary"
                  onClick={() => { openStatus(selected); }}
                >
                  <CheckCircle size={14} /> Update status
                </button>
              )}
            </>
          }
        >
          {status === 'loading' && !selected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--nw-text-muted)' }}>
              <span className="nw-spinner" /> Loading…
            </div>
          ) : selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="nw-grid-2">
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--nw-text-dim)', marginBottom: 4 }}>Name</div>
                  <div style={{ fontWeight: 600 }}>{selected.name || selected.fullName || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--nw-text-dim)', marginBottom: 4 }}>Email</div>
                  <div>
                    <a href={`mailto:${selected.email}`} style={{ color: 'var(--nw-accent, #EE4F27)' }}>
                      {selected.email || '—'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="nw-grid-2">
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--nw-text-dim)', marginBottom: 4 }}>Position</div>
                  <div>{selected.position || selected.role || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--nw-text-dim)', marginBottom: 4 }}>Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {statusIcon(selected.status)}
                    <StatusBadge status={selected.status || 'PENDING'} />
                  </div>
                </div>
              </div>

              {selected.phone && (
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--nw-text-dim)', marginBottom: 4 }}>Phone</div>
                  <div>{selected.phone}</div>
                </div>
              )}

              {selected.coverLetter || selected.message ? (
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--nw-text-dim)', marginBottom: 6 }}>
                    Cover letter / Message
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--nw-border, rgba(255,255,255,0.08))',
                    borderRadius: 8, padding: '10px 14px',
                    color: 'var(--nw-text-muted)',
                    fontSize: 13, lineHeight: 1.7,
                    maxHeight: 180, overflowY: 'auto',
                  }}>
                    {selected.coverLetter || selected.message}
                  </div>
                </div>
              ) : null}

              {selected.resumeUrl || selected.portfolioUrl ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selected.resumeUrl && (
                    <a
                      href={selected.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="nw-btn nw-btn--ghost nw-btn--sm"
                    >
                      View resume
                    </a>
                  )}
                  {selected.portfolioUrl && (
                    <a
                      href={selected.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="nw-btn nw-btn--ghost nw-btn--sm"
                    >
                      Portfolio
                    </a>
                  )}
                </div>
              ) : null}

              {selected.notes && (
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--nw-text-dim)', marginBottom: 6 }}>
                    Review notes
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--nw-border, rgba(255,255,255,0.08))',
                    borderRadius: 8, padding: '10px 14px',
                    color: 'var(--nw-text-muted)', fontSize: 13, lineHeight: 1.7,
                  }}>
                    {selected.notes}
                  </div>
                </div>
              )}

              <div style={{ color: 'var(--nw-text-dim)', fontSize: 12 }}>
                Submitted {formatDate(selected.createdAt)}
              </div>
            </div>
          ) : null}
        </Modal>
      )}

      {/* ── Update status modal ──────────────────────────────────────────── */}
      {modal === 'status' && selected && (
        <Modal
          title={`Update status — ${selected.name || selected.fullName}`}
          onClose={closeModal}
          footer={
            <>
              <button
                className="nw-btn nw-btn--ghost"
                onClick={closeModal}
                disabled={actStatus === 'loading'}
              >
                Cancel
              </button>
              <button
                className="nw-btn nw-btn--primary"
                onClick={submitStatus}
                disabled={actStatus === 'loading'}
              >
                {actStatus === 'loading' ? <span className="nw-spinner" /> : <CheckCircle size={14} />}
                Save
              </button>
            </>
          }
        >
          <div className="nw-field">
            <label className="nw-field__lbl">Status</label>
            <select
              className="nw-select"
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
            >
              <option value="PENDING">Pending</option>
              <option value="REVIEWING">Reviewing</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="nw-field">
            <label className="nw-field__lbl">Notes <span style={{ color: 'var(--nw-text-dim)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              className="nw-textarea"
              rows={4}
              placeholder="Internal review notes…"
              value={statusForm.notes}
              onChange={(e) => setStatusForm({ ...statusForm, notes: e.target.value })}
            />
          </div>
          {actError && (
            <p style={{ color: '#fca5a5', margin: '8px 0 0', fontSize: 13 }}>{actError}</p>
          )}
        </Modal>
      )}

      {/* ── Delete modal ─────────────────────────────────────────────────── */}
      {modal === 'delete' && selected && (
        <Modal
          title="Delete application"
          onClose={closeModal}
          footer={
            <>
              <button
                className="nw-btn nw-btn--ghost"
                onClick={closeModal}
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
            Permanently delete the application from{' '}
            <strong style={{ color: '#fff' }}>{selected.name || selected.fullName}</strong>?
            This action cannot be undone.
          </p>
          {actError && (
            <p style={{ color: '#fca5a5', marginTop: 12, fontSize: 13 }}>{actError}</p>
          )}
        </Modal>
      )}
    </>
  );
};

export default AdminApplications;