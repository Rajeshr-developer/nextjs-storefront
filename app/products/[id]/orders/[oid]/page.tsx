import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string; oid: string }>;
}) {
  const { id: rawId, oid: rawOid } = await params;
  const productId = Number(rawId);
  const orderId = Number(rawOid);

  if (isNaN(productId) || isNaN(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, product: true },
  });

  if (!order || order.product_id !== productId) notFound();

  const [prevOrder, nextOrder] = await Promise.all([
    prisma.order.findFirst({
      where: { product_id: productId, id: { lt: orderId } },
      orderBy: { id: 'desc' },
      select: { id: true },
    }),
    prisma.order.findFirst({
      where: { product_id: productId, id: { gt: orderId } },
      orderBy: { id: 'asc' },
      select: { id: true },
    }),
  ]);

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

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/products">Products</Link>
        <span>→</span>
        <Link href={`/products/${productId}`}>
          {order.product?.name}
        </Link>
        <span>→</span>
        <Link href={`/products/${productId}/orders`}>Orders</Link>
        <span>→</span>
        <span className="breadcrumb-current">#{order.id}</span>
      </div>

      {/* Cache banner */}
      <div className="cache-banner-red">
        <span>🔄 force-dynamic — always fresh (status changes anytime)</span>
        <span>Rendered at: {new Date().toLocaleTimeString('en-GB')}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Order #{order.id}</div>
          <div className="page-subtitle">
            {order.product?.name} · {order.created_at
              ? new Date(order.created_at).toLocaleDateString('en-GB')
              : '—'}
          </div>
        </div>
        <span
          className={`badge ${statusBadge(order.status)}`}
          style={{ fontSize: 13, padding: '6px 14px' }}
        >
          {order.status ?? 'unknown'}
        </span>
      </div>

      {/* Detail grid */}
      <div className="detail-grid">

        {/* Order details */}
        <div className="card">
          <div className="chart-title">Order Details</div>
          {[
            { label: 'Order ID', value: `#${order.id}` },
            { label: 'Quantity', value: order.quantity ?? '—' },
            {
              label: 'Unit Price',
              value: `₹${Number(order.product?.price ?? 0).toLocaleString()}`,
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
            <div key={label} className="detail-row">
              <span className="detail-row-label">{label}</span>
              <span
                className="detail-row-value"
                style={{
                  fontSize: highlight ? 18 : 14,
                  color: color ?? (highlight ? '#00d4aa' : 'var(--text)'),
                }}
              >
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
            <div style={{ color: 'var(--accent2)', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
              ₹{Number(order.product?.price ?? 0).toLocaleString()}
            </div>
            {order.product?.category && (
              <span className="badge badge-blue">
                {order.product.category}
              </span>
            )}
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
              Stock: {order.product?.stock ?? 0} units remaining
            </div>
            <Link
              href={`/products/${productId}`}
              style={{
                display: 'inline-block', marginTop: 12,
                color: 'var(--accent)', fontSize: 12,
                textDecoration: 'none', fontWeight: 600,
              }}
            >
              View Product →
            </Link>
          </div>

          {/* Customer card */}
          <div className="card">
            <div className="chart-title">Customer</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              {order.user?.name ?? '—'}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
              {order.user?.email ?? '—'}
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
            {order.user && (
              <Link
                href={`/users/${order.user.id}`}
                style={{
                  display: 'inline-block', marginTop: 12,
                  color: 'var(--accent)', fontSize: 12,
                  textDecoration: 'none', fontWeight: 600,
                }}
              >
                View Profile →
              </Link>
            )}
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
            href={`/products/${productId}/orders/${prevOrder.id}`}
            className="btn btn-ghost"
          >
            ← Order #{prevOrder.id}
          </Link>
        ) : <div />}

        <Link
          href={`/products/${productId}/orders`}
          className="btn btn-ghost"
          style={{ color: 'var(--muted)' }}
        >
          All Orders
        </Link>

        {nextOrder ? (
          <Link
            href={`/products/${productId}/orders/${nextOrder.id}`}
            className="btn btn-ghost"
          >
            Order #{nextOrder.id} →
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
