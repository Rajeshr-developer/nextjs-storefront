'use client';
import { useState } from 'react';
import { createUser, updateUser, deleteUser } from './actions';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import type { User } from '@prisma/client';

function formatDate(date: string | Date | null) {
  if (!date) return '—';
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })} ${d.getFullYear()}`;
}

export default function UsersClient({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', age: '', role: '', active: true });
  const [loading, setLoading] = useState(false);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setForm({ name: '', email: '', age: '', role: '', active: true });
    setEditing(null);
    setModal('create');
  }

  function openEdit(u: User) {
    setForm({ name: u.name, email: u.email, age: u.age?.toString() ?? '', role: u.role ?? '', active: u.active ?? true });
    setEditing(u);
    setModal('edit');
  }

  async function handleSubmit() {
    setLoading(true);
    const data = { name: form.name, email: form.email, age: form.age ? Number(form.age) : undefined, role: form.role || undefined, active: form.active };
    if (modal === 'create') {
      await createUser(data);
      setUsers(prev => [{ id: Date.now(), ...data, age: data.age ?? null, role: data.role ?? null, active: data.active, created_at: new Date() }, ...prev]);
    } else if (editing) {
      await updateUser(editing.id, data);
      setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...data } : u));
    }
    setLoading(false);
    setModal(null);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this user?')) return;
    await deleteUser(id);
    setUsers(prev => prev.filter(u => u.id !== id));
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Users</div>
          <div className="page-subtitle">{users.length} registered accounts</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-bar">
            <Search size={14} />
            <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Add User</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Age</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state">No users found</div></td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: 'var(--muted)' }}>{u.email}</td>
                  <td>{u.age ?? '—'}</td>
                  <td>{u.role ? <span className="badge badge-blue">{u.role}</span> : '—'}</td>
                  <td><span className={`badge ${u.active ? 'badge-green' : 'badge-gray'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ color: 'var(--muted)' }}>{u.created_at ? formatDate(u.created_at) : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}><Pencil size={12} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{modal === 'create' ? 'Add User' : 'Edit User'}</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="admin, user..." />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.active ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, active: e.target.value === 'true' }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
