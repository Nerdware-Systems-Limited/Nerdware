import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FileText, Briefcase, Users, MessageSquare, Plus } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import StatusBadge from '../../components/admin/StatusBadge';

import { fetchBlogs, selectAllBlogs, selectBlogsStatus } from '../../redux/slices/Blogslice';
import { fetchAllPortfolios, selectAllPortfolios } from '../../redux/slices/portfolioSlice';
import { fetchAllUsers, selectAllUsers } from '../../redux/slices/userSlice';
import { fetchMessages, selectMessages } from '../../redux/slices/miscSlice';
import { selectUser } from '../../redux/slices/authslice';

const formatDate = (s) =>
  s ? new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';

const AdminOverview = () => {
  const dispatch = useDispatch();
  const user      = useSelector(selectUser);
  const blogs     = useSelector(selectAllBlogs);
  const blogStatus= useSelector(selectBlogsStatus);
  const portfolios= useSelector(selectAllPortfolios);
  const users     = useSelector(selectAllUsers);
  const messages  = useSelector(selectMessages);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    dispatch(fetchBlogs());
    dispatch(fetchAllPortfolios());
    if (isAdmin) {
      dispatch(fetchAllUsers());
      dispatch(fetchMessages());
    }
  }, [dispatch, isAdmin]);

  const published = blogs.filter((b) => b.status === 'PUBLISHED').length;
  const drafts    = blogs.filter((b) => b.status === 'DRAFT').length;

  // Last 7 days "posts created" mini chart
  const bars = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });
    return days.map((d) => {
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const count = blogs.filter((b) => {
        const t = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return t >= d.getTime() && t < next.getTime();
      }).length;
      return { day: d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2), count };
    });
  }, [blogs]);
  const maxCount = Math.max(1, ...bars.map((b) => b.count));

  const recentBlogs = [...blogs]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Admin'}`}
        subtitle="Here’s what’s happening across your workspace today."
        actions={
          <Link to="/admin/blog/new" className="nw-btn nw-btn--primary">
            <Plus size={16} /> New post
          </Link>
        }
      />

      <div className="nw-stats">
        <StatCard label="Published posts" value={published} delta="+12% this month" icon={FileText} />
        <StatCard label="Drafts"          value={drafts}    delta={`${drafts} pending`} trend="up" icon={FileText} />
        <StatCard label="Portfolio items" value={portfolios.length} delta="+3 new" icon={Briefcase} />
        {isAdmin && (
          <StatCard label="Total users" value={users.length} delta="+8 this week" icon={Users} />
        )}
        {isAdmin && (
          <StatCard label="Unread messages" value={messages.filter((m) => m.status === 'UNREAD').length} delta="needs review" trend="down" icon={MessageSquare} />
        )}
      </div>

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
        {/* Posts last 7 days */}
        <section className="nw-card">
          <div className="nw-card__hd">
            <h3>Posts created · last 7 days</h3>
            <Link to="/admin/blog" className="nw-btn nw-btn--ghost nw-btn--sm">View all</Link>
          </div>
          <div className="nw-card__bd">
            <div className="nw-bars">
              {bars.map((b, i) => (
                <div
                  key={i}
                  className="nw-bars__col"
                  style={{ height: `${(b.count / maxCount) * 100}%`, minHeight: 6 }}
                  title={`${b.count} post${b.count === 1 ? '' : 's'}`}
                />
              ))}
            </div>
            <div className="nw-bars__row">
              {bars.map((b, i) => <span key={i}>{b.day}</span>)}
            </div>
          </div>
        </section>

        {/* Activity feed */}
        <section className="nw-card">
          <div className="nw-card__hd"><h3>Recent activity</h3></div>
          <div className="nw-card__bd">
            <div className="nw-feed">
              {(blogStatus === 'loading' && !blogs.length) && (
                <div className="nw-feed__item"><span className="nw-spinner" /> <span>Loading…</span></div>
              )}
              {recentBlogs.map((b) => (
                <div key={b.id} className="nw-feed__item">
                  <span className="nw-feed__dot" />
                  <div>
                    <div className="nw-feed__txt">
                      Post <strong>“{b.title}”</strong> was {b.status === 'PUBLISHED' ? 'published' : 'updated'}
                    </div>
                    <div className="nw-feed__meta">
                      {formatDate(b.updatedAt || b.createdAt)} · {b.category || 'Uncategorised'}
                    </div>
                  </div>
                </div>
              ))}
              {!recentBlogs.length && blogStatus !== 'loading' && (
                <div style={{ color: 'var(--nw-text-muted)', fontSize: 13 }}>No activity yet.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Recent posts table */}
      <section className="nw-card" style={{ marginTop: 16 }}>
        <div className="nw-card__hd">
          <h3>Recent posts</h3>
          <Link to="/admin/blog" className="nw-btn nw-btn--ghost nw-btn--sm">Manage blog</Link>
        </div>
        <div className="nw-table-wrap" style={{ border: 0, borderRadius: 0, background: 'transparent' }}>
          <table className="nw-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Category</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentBlogs.map((b) => (
                <tr key={b.id}>
                  <td>
                    <div className="nw-row-title">{b.title}</div>
                    <div className="nw-row-sub">{b.author?.name || '—'}</div>
                  </td>
                  <td><StatusBadge status={b.status} /></td>
                  <td style={{ color: 'var(--nw-text-muted)' }}>{b.category || '—'}</td>
                  <td style={{ color: 'var(--nw-text-muted)' }}>{formatDate(b.updatedAt || b.createdAt)}</td>
                </tr>
              ))}
              {!recentBlogs.length && (
                <tr><td colSpan={4} style={{ color: 'var(--nw-text-muted)' }}>No posts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default AdminOverview;
