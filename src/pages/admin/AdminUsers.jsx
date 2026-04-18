import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, Pencil, Trash2, Users as UsersIcon } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import EmptyState from '../../components/admin/EmptyState';

import {
  fetchAllUsers, createUser, updateUser, deleteUser,
  selectAllUsers, selectUsersStatus, selectUsersError,
  selectActionStatus, selectActionError, clearActionState,
} from '../../redux/slices/userSlice';

const initials = (name = '?') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

const AdminUsers = () => {
  const dispatch  = useDispatch();
  const users     = useSelector(selectAllUsers);
  const status    = useSelector(selectUsersStatus);
  const error     = useSelector(selectUsersError);
  const actStatus = useSelector(selectActionStatus);
  const actError  = useSelector(selectActionError);

  const [search, setSearch] = useState('');
  const [role, setRole]     = useState('ALL');
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'USER', isActive: true });
  const [fErr, setFErr]     = useState({});

  useEffect(() => { dispatch(fetchAllUsers()); }, [dispatch]);
  useEffect(() => {
    if (actStatus === 'succeeded') {
      setModal(null);
      dispatch(clearActionState());
      dispatch(fetchAllUsers());
    }
  }, [actStatus, dispatch]);

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', role: 'USER', isActive: true });
    setFErr({}); setModal({ type: 'create' });
  };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, isActive: u.isActive ?? true });
    setFErr({}); setModal({ type: 'edit', data: u });
  };
  const openDel = (u) => setModal({ type: 'delete', data: u });

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (modal?.type === 'create' && form.password.length < 6) e.password = 'Min 6 characters';
    return e;
  };
  const submit = () => {
    const e = validate(); setFErr(e); if (Object.keys(e).length) return;
    if (modal.type === 'create') dispatch(createUser(form));
    else dispatch(updateUser({ id: modal.data.id, name: form.name, role: form.role, isActive: form.isActive }));
  };

  const filtered = useMemo(() => users.filter((u) => {
    if (role !== 'ALL' && u.role !== role) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return [u.name, u.email].some((v) => v?.toLowerCase().includes(s));
  }), [users, role, search]);

  const isLoading = status === 'loading' && !users.length;

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Manage admins, editors and platform members."
        actions={
          <button className="nw-btn nw-btn--primary" onClick={openCreate}>
            <Plus size={16} /> New user
          </button>
        }
      />

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['ALL', 'ADMIN', 'EDITOR', 'USER'].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`nw-btn nw-btn--sm ${role === r ? 'nw-btn--primary' : 'nw-btn--ghost'}`}
          >
            {r === 'ALL' ? 'All' : r.charAt(0) + r.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="nw-table-wrap">
        <div className="nw-table-toolbar">
          <div className="nw-topbar__search nw-search-input" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <Search size={16} color="rgba(255,255,255,0.5)" />
            <input
              placeholder="Search users by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="nw-empty"><span className="nw-spinner" /> Loading users…</div>
        ) : error ? (
          <div className="nw-empty" style={{ color: '#fca5a5' }}>{error}</div>
        ) : !filtered.length ? (
          <EmptyState icon={UsersIcon} title="No users found" message="Try adjusting your search or filters." />
        ) : (
          <table className="nw-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="nw-avatar">{initials(u.name)}</div>
                      <div>
                        <div className="nw-row-title">{u.name}</div>
                        <div className="nw-row-sub">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><StatusBadge status={u.role} /></td>
                  <td><StatusBadge status={u.isActive === false ? 'INACTIVE' : 'ACTIVE'} /></td>
                  <td style={{ color: 'var(--nw-text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="nw-icon-btn" title="Edit" onClick={() => openEdit(u)}>
                        <Pencil size={15} />
                      </button>
                      <button className="nw-icon-btn" title="Delete" style={{ color: '#fca5a5' }} onClick={() => openDel(u)}>
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

      {modal && (modal.type === 'create' || modal.type === 'edit') && (
        <Modal
          title={modal.type === 'create' ? 'Create user' : `Edit ${modal.data.name}`}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="nw-btn nw-btn--ghost" onClick={() => setModal(null)} disabled={actStatus === 'loading'}>Cancel</button>
              <button className="nw-btn nw-btn--primary" onClick={submit} disabled={actStatus === 'loading'}>
                {actStatus === 'loading' ? <span className="nw-spinner" /> : null}
                {modal.type === 'create' ? 'Create' : 'Save'}
              </button>
            </>
          }
        >
          <div className="nw-grid-2">
            <div className="nw-field">
              <label className="nw-field__lbl">Name <span className="req">*</span></label>
              <input className="nw-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {fErr.name && <span className="nw-field__err">{fErr.name}</span>}
            </div>
            <div className="nw-field">
              <label className="nw-field__lbl">Email <span className="req">*</span></label>
              <input className="nw-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={modal.type === 'edit'} />
              {fErr.email && <span className="nw-field__err">{fErr.email}</span>}
            </div>
          </div>

          {modal.type === 'create' && (
            <div className="nw-field">
              <label className="nw-field__lbl">Password <span className="req">*</span></label>
              <input className="nw-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {fErr.password && <span className="nw-field__err">{fErr.password}</span>}
            </div>
          )}

          <div className="nw-grid-2">
            <div className="nw-field">
              <label className="nw-field__lbl">Role</label>
              <select className="nw-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="USER">User</option>
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="nw-field">
              <label className="nw-field__lbl">Status</label>
              <select className="nw-select" value={form.isActive ? 'true' : 'false'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {actError && <p className="nw-field__err">{actError}</p>}
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal
          title="Delete user"
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="nw-btn nw-btn--ghost" onClick={() => setModal(null)} disabled={actStatus === 'loading'}>Cancel</button>
              <button
                className="nw-btn nw-btn--danger"
                onClick={() => dispatch(deleteUser(modal.data.id))}
                disabled={actStatus === 'loading'}
              >
                {actStatus === 'loading' ? <span className="nw-spinner" /> : <Trash2 size={14} />}
                Delete
              </button>
            </>
          }
        >
          <p style={{ margin: 0, color: 'var(--nw-text-muted)' }}>
            Permanently delete <strong style={{ color: '#fff' }}>{modal.data.name}</strong>?
            This cannot be undone.
          </p>
          {actError && <p className="nw-field__err" style={{ marginTop: 10 }}>{actError}</p>}
        </Modal>
      )}
    </>
  );
};

export default AdminUsers;
