import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Always fresh — order status changes anytime
export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string; oid: string };
}) {
  const userId = Number(params.id);
  const orderId = Number(params.oid);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, product: true },
  });

  // 404 if order not found OR doesn't belong to this user
  if (!order || order.user_id !== userId) notFound();

  function statusBadge(status: string | null) {
    const map: Record<string, string> = {
      pending: 'badge-yellow',
      completed: 'badge-green',
      cancelled: 'badge-red',
      processing: 'badge-blue',
    };
    return map[status?.toLowerCase() ?? ''] ?? 'badge-gray';
  }

  function statusColor(status: string | null) {
    const map: Record<string, string> = {
      pending: '#f5a623',
      completed: '#00d4aa',
      cancelled: '#ff4f4f',
      processing: '#6c63ff',
    };
    return map[status?.toLowerCase() ?? ''] ?? 'var(--muted)';
  }

  const prevOrder = await prisma.order.findFirst({
    where: { user_id: userId, id: { lt: orderId } },
    orderBy: { id: 'desc' },
    select: { id: true },
  });

  const nextOrder = await prisma.order.findFirst({
    where: { user_id: userId, id: { gt: orderId } },
    orderBy: { id: 'asc' },
    select: { id: true },
  });

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        marginBottom: 24, fontSize: 13, color: 'var(--muted)',
        flexWrap: 'wrap',
      }}>
        <Link href="/users" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          Users
        </Link>
        <span>→</span>
        <Link
          href={`/users/${userId}`}
          style={{ color: 'var(--muted)', textDecoration: 'none' }}
        >
          {order.user?.name}
        </Link>
        <span>→</span>
        <Link
          href={`/users/${userId}/orders`}
          style={{ color: 'var(--muted)', textDecoration: 'none' }}
        >
          Orders
        </Link>
        <span>→</span>
        <span style={{ color: 'var(--text)' }}>#{order.id}</span>
      </div>

      {/* Cache info — force dynamic */}
      <div style={{
        padding: '8px 14px', marginBottom: 24,
        background: 'rgba(255,79,79,0.1)',
        border: '1px solid rgba(255,79,79,0.2)',
        borderRadius: 7, fontSize: 12, color: '#ff4f4f',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>🔄 force-dynamic — always fresh (status changes anytime)</span>
        <span>Rendered at: {new Date().toLocaleTimeString('en-GB')}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Order #{order.id}</div>
          <div className="page-subtitle">
            Placed by {order.user?.name} · {order.created_at
              ? new Date(order.created_at).toLocaleDateString('en-GB')
              : '—'}
          </div>
        </div>
        <span className={`badge ${statusBadge(order.status)}`}
          style={{ fontSize: 13, padding: '6px 14px' }}
        >
          {order.status ?? 'unknown'}
        </span>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Order details */}
        <div className="card">
          <div className="chart-title">Order Details</div>
          {[
            { label: 'Order ID', value: `#${order.id}` },
            { label: 'Quantity', value: order.quantity ?? '—' },
            {
              label: 'Unit Price',
              value: order.product
                ? `₹${Number(order.product.price).toLocaleString()}`
                : '—'
            },
            {
              label: 'Total',
              value: `₹${Number(order.total_price ?? 0).toLocaleString()}`,
              highlight: true,
            },
            {
              label: 'Status',
              value: order.status ?? '—',
              color: statusColor(order.status),
            },
            {
              label: 'Date',
              value: order.created_at
                ? new Date(order.created_at).toLocaleDateString('en-GB')
                : '—',
            },
          ].map(({ label, value, highlight, color }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                {label}
              </span>
              <span style={{
                fontWeight: highlight ? 700 : 600,
                fontSize: highlight ? 18 : 14,
                color: color ?? (highlight ? '#00d4aa' : 'var(--text)'),
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Product card */}
          <div className="card">
            <div className="chart-title">Product</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
              {order.product?.name ?? '—'}
            </div>
            <div style={{
              color: '#00d4aa', fontWeight: 700,
              fontSize: 18, marginBottom: 10,
            }}>
              ₹{Number(order.product?.price ?? 0).toLocaleString()}
            </div>
            {order.product?.category && (
              <span className="badge badge-blue">
                {order.product.category}
              </span>
            )}
            {order.product?.stock !== null && (
              <div style={{
                marginTop: 12, fontSize: 12, color: 'var(--muted)'
              }}>
                Stock remaining: {order.product?.stock} units
              </div>
            )}
          </div>

          {/* Customer card */}
          <div className="card">
            <div className="chart-title">Customer</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {order.user?.name}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              {order.user?.email}
            </div>
            <div style={{ marginTop: 6 }}>
              <span className={`badge ${order.user?.active ? 'badge-green' : 'badge-gray'}`}>
                {order.user?.active ? 'Active' : 'Inactive'}
              </span>
              {order.user?.role && (
                <span className="badge badge-blue" style={{ marginLeft: 6 }}>
                  {order.user.role}
                </span>
              )}
            </div>
            <Link
              href={`/users/${order.user?.id}`}
              style={{
                display: 'inline-block', marginTop: 12,
                color: 'var(--accent)', fontSize: 12,
                textDecoration: 'none', fontWeight: 600,
              }}
            >
              View Profile →
            </Link>
          </div>
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 24, gap: 12,
      }}>
        {prevOrder ? (
          <Link
            href={`/users/${userId}/orders/${prevOrder.id}`}
            style={{
              padding: '10px 20px', background: 'var(--surface2)',
              color: 'var(--text)', borderRadius: 7,
              textDecoration: 'none', fontSize: 13, fontWeight: 600,
              border: '1px solid var(--border)',
            }}
          >
            ← Order #{prevOrder.id}
          </Link>
        ) : <div />}

        <Link
          href={`/users/${userId}/orders`}
          style={{
            padding: '10px 20px', background: 'var(--surface)',
            color: 'var(--muted)', borderRadius: 7,
            textDecoration: 'none', fontSize: 13,
            border: '1px solid var(--border)',
          }}
        >
          All Orders
        </Link>

        {nextOrder ? (
          <Link
            href={`/users/${userId}/orders/${nextOrder.id}`}
            style={{
              padding: '10px 20px', background: 'var(--surface2)',
              color: 'var(--text)', borderRadius: 7,
              textDecoration: 'none', fontSize: 13, fontWeight: 600,
              border: '1px solid var(--border)',
            }}
          >
            Order #{nextOrder.id} →
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
