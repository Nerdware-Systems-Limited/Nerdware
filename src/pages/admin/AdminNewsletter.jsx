import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Mail, Download, ChevronLeft, ChevronRight } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import EmptyState from '../../components/admin/EmptyState';

import {
  fetchSubscribers,
  selectSubscribers, selectSubscribersStatus, selectSubscribersPagination,
} from '../../redux/slices/miscSlice';

const STATUS_TABS = ['ALL', 'ACTIVE', 'UNSUBSCRIBED'];
const LIMIT = 20;
/* Maps a tab to the backend's `active` query param — the endpoint only
   supports this boolean filter, so text search stays client-side below. */
const TAB_ACTIVE_PARAM = { ALL: undefined, ACTIVE: 'true', UNSUBSCRIBED: 'false' };

const formatDate = (s) =>
  s
    ? new Date(s).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : '—';

/* ── tiny stat card re-used inline ──────────────────────────────────────── */
const MiniStat = ({ label, value, icon: Icon, accent }) => (
  <div className="nw-card" style={{ flex: 1, minWidth: 140 }}>
    <div className="nw-card__bd" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        display: 'grid', placeItems: 'center',
        background: accent ? 'rgba(238,79,39,0.12)' : 'rgba(255,255,255,0.06)',
        color: accent ? 'var(--nw-accent, #EE4F27)' : 'var(--nw-text-muted)',
      }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--nw-text-muted)', marginTop: 3 }}>{label}</div>
      </div>
    </div>
  </div>
);

const AdminNewsletter = () => {
  const dispatch     = useDispatch();
  const subscribers  = useSelector(selectSubscribers);
  const status       = useSelector(selectSubscribersStatus);
  const pagination   = useSelector(selectSubscribersPagination);

  const [tab, setTab]       = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  useEffect(() => { setPage(1); }, [tab]);

  useEffect(() => {
    dispatch(fetchSubscribers({ page, limit: LIMIT, active: TAB_ACTIVE_PARAM[tab] }));
  }, [dispatch, page, tab]);

  /* ── Filtered list — text search stays client-side, scoped to the
     current page, since the endpoint has no free-text search param ────── */
  const filtered = useMemo(() => {
    if (!search) return subscribers;
    const q = search.toLowerCase();
    return subscribers.filter((s) => [s.email, s.name].some((v) => v?.toLowerCase().includes(q)));
  }, [subscribers, search]);

  /* ── CSV export ──────────────────────────────────────────────────────── */
  const exportCSV = () => {
    const rows = [
      ['Email', 'Name', 'Status', 'Subscribed'],
      ...filtered.map((s) => [
        s.email || '',
        s.name  || '',
        s.status !== 'UNSUBSCRIBED' && s.isActive !== false ? 'Active' : 'Unsubscribed',
        formatDate(s.createdAt),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a   = document.createElement('a');
    a.href    = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = status === 'loading';

  return (
    <>
      <PageHeader
        title="Newsletter"
        subtitle="Manage your subscriber list and monitor growth."
        actions={
          filtered.length > 0 && (
            <button className="nw-btn nw-btn--ghost" onClick={exportCSV}>
              <Download size={16} /> Export CSV
            </button>
          )
        }
      />

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <MiniStat
          label={tab === 'ALL' ? 'Total subscribers' : tab === 'ACTIVE' ? 'Active subscribers' : 'Unsubscribed'}
          value={pagination.total}
          icon={Mail}
          accent
        />
      </div>

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
              placeholder="Search by email or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: 13, color: 'var(--nw-text-dim)', marginLeft: 'auto', flexShrink: 0 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="nw-empty">
            <span className="nw-spinner" />
            <span style={{ marginLeft: 10 }}>Loading subscribers…</span>
          </div>
        ) : !filtered.length ? (
          <EmptyState
            icon={Mail}
            title={search || tab !== 'ALL' ? 'No matching subscribers' : 'No subscribers yet'}
            message={
              search || tab !== 'ALL'
                ? 'Try a different search or filter.'
                : 'Subscribers from your newsletter sign-up form will appear here.'
            }
          />
        ) : (
          <>
          <table className="nw-table">
            <thead>
              <tr>
                <th style={{ minWidth: 240 }}>Email</th>
                <th>Name</th>
                <th>Status</th>
                <th>Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const isActive = s.status !== 'UNSUBSCRIBED' && s.isActive !== false;
                return (
                  <tr key={s.id || s.email || i}>
                    <td>
                      <div className="nw-row-title" style={{ fontWeight: 500 }}>{s.email}</div>
                    </td>
                    <td style={{ color: 'var(--nw-text-muted)' }}>{s.name || '—'}</td>
                    <td>
                      <StatusBadge status={isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td style={{ color: 'var(--nw-text-muted)' }}>
                      {formatDate(s.createdAt || s.subscribedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="nw-pagination">
              <span className="nw-pagination__status">
                Page {pagination.page} of {pagination.pages} · {pagination.total} subscribers
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
    </>
  );
};

export default AdminNewsletter;