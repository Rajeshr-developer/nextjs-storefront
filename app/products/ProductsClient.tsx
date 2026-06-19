'use client';
import { useState } from 'react';
import { createProduct, updateProduct, deleteProduct } from './actions';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import type { Product } from '@prisma/client';

function formatDate(date: string | Date | null) {
  if (!date) return '—';
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })} ${d.getFullYear()}`;
}

export default function ProductsClient({ products: initial }: { products: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', price: '', category: '', stock: '' });
  const [loading, setLoading] = useState(false);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setForm({ name: '', price: '', category: '', stock: '' });
    setEditing(null);
    setModal('create');
  }

  function openEdit(p: Product) {
    setForm({ name: p.name, price: p.price.toString(), category: p.category ?? '', stock: p.stock?.toString() ?? '' });
    setEditing(p);
    setModal('edit');
  }

  async function handleSubmit() {
    setLoading(true);
    const data = { name: form.name, price: Number(form.price), category: form.category || undefined, stock: form.stock ? Number(form.stock) : undefined };
    if (modal === 'create') {
      await createProduct(data);
      setProducts(prev => [{ id: Date.now(), ...data, price: data.price as any, category: data.category ?? null, stock: data.stock ?? null, created_at: new Date() }, ...prev]);
    } else if (editing) {
      await updateProduct(editing.id, data);
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...data } : p));
    }
    setLoading(false);
    setModal(null);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  function stockBadge(stock: number | null) {
    if (!stock) return 'badge-red';
    if (stock < 10) return 'badge-yellow';
    return 'badge-green';
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-subtitle">{products.length} items in catalogue</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-bar">
            <Search size={14} />
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Add Product</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Price</th><th>Category</th><th>Stock</th><th>Added</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6}><div className="empty-state">No products found</div></td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ color: 'var(--accent2)', fontWeight: 600 }}>₹{Number(p.price).toLocaleString()}</td>
                  <td>{p.category ? <span className="badge badge-blue">{p.category}</span> : '—'}</td>
                  <td><span className={`badge ${stockBadge(p.stock)}`}>{p.stock ?? 0} units</span></td>
                  <td style={{ color: 'var(--muted)' }}>{p.created_at ? formatDate(p.created_at) : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><Pencil size={12} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><Trash2 size={12} /></button>
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
            <div className="modal-title">{modal === 'create' ? 'Add Product' : 'Edit Product'}</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input className="form-input" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Stock</label>
                <input className="form-input" type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
              </div>
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
