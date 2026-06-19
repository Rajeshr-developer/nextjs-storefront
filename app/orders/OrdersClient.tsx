'use client';
import { useState } from 'react';
import { createOrder, updateOrderStatus, deleteOrder } from './actions';
import { Plus, Trash2, Search, RefreshCw } from 'lucide-react';

function formatDate(date: string | Date | null) {
  if (!date) return '—';
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })} ${d.getFullYear()}`;
}

type Order = {
  id: number; user_id: number | null; product_id: number | null;
  quantity: number | null; total_price: any; status: string | null;
  created_at: Date | null;
  user: { id: number; name: string } | null;
  product: { id: number; name: string; price: any } | null;
};

const STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

function statusBadge(s: string | null) {
  const map: Record<string, string> = { pending: 'badge-yellow', completed: 'badge-green', cancelled: 'badge-red', processing: 'badge-blue' };
  return map[s?.toLowerCase() ?? ''] ?? 'badge-gray';
}

export default function OrdersClient({
  orders: initial, users, products,
}: {
  orders: Order[];
  users: { id: number; name: string }[];
  products: { id: number; name: string; price: any }[];
}) {
  const [orders, setOrders] = useState(initial);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ user_id: '', product_id: '', quantity: '1', status: 'pending' });
  const [loading, setLoading] = useState(false);

  const filtered = orders.filter(o => {
    const matchSearch =
      o.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      o.product?.name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const selectedProduct = products.find(p => p.id === Number(form.product_id));
  const computedTotal = selectedProduct ? Number(selectedProduct.price) * Number(form.quantity || 1) : 0;

  async function handleCreate() {
    if (!form.user_id || !form.product_id) return;
    setLoading(true);
    await createOrder({
      user_id: Number(form.user_id),
      product_id: Number(form.product_id),
      quantity: Number(form.quantity),
      total_price: computedTotal,
      status: form.status,
    });
    const user = users.find(u => u.id === Number(form.user_id)) ?? null;
    const product = products.find(p => p.id === Number(form.product_id)) ?? null;
    setOrders(prev => [{
      id: Date.now(), user_id: Number(form.user_id), product_id: Number(form.product_id),
      quantity: Number(form.quantity), total_price: computedTotal, status: form.status,
      created_at: new Date(), user, product,
    }, ...prev]);
    setLoading(false);
    setModal(false);
  }

  async function handleStatusChange(id: number, status: string) {
    await updateOrderStatus(id, status);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this order?')) return;
    await deleteOrder(id);
    setOrders(prev => prev.filter(o => o.id !== id));
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-subtitle">{orders.length} total orders</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-bar">
            <Search size={14} />
            <input placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-input" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={14} /> New Order</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state">No orders found</div></td></tr>
              ) : filtered.map(o => (
                <tr key={o.id}>
                  <td style={{ color: 'var(--accent)', fontWeight: 700 }}>#{o.id}</td>
                  <td style={{ fontWeight: 600 }}>{o.user?.name ?? '—'}</td>
                  <td>{o.product?.name ?? '—'}</td>
                  <td>{o.quantity ?? '—'}</td>
                  <td style={{ color: 'var(--accent2)', fontWeight: 600 }}>₹{Number(o.total_price ?? 0).toLocaleString()}</td>
                  <td>
                    <select
                      className="form-input"
                      style={{ padding: '3px 8px', width: 'auto', fontSize: 12 }}
                      value={o.status ?? 'pending'}
                      onChange={e => handleStatusChange(o.id, e.target.value)}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{o.created_at ? formatDate(o.created_at) : '—'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">New Order</div>
            <div className="form-group">
              <label className="form-label">Customer</label>
              <select className="form-input" value={form.user_id} onChange={e => setForm(p => ({ ...p, user_id: e.target.value }))}>
                <option value="">Select customer...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Product</label>
              <select className="form-input" value={form.product_id} onChange={e => setForm(p => ({ ...p, product_id: e.target.value }))}>
                <option value="">Select product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{Number(p.price).toLocaleString()}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {selectedProduct && (
              <div style={{ background: 'var(--surface2)', borderRadius: 7, padding: '10px 14px', marginBottom: 16 }}>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>Total: </span>
                <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>₹{computedTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={loading || !form.user_id || !form.product_id}>
                {loading ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
