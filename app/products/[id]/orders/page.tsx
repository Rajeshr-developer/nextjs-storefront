import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 10;

export default async function ProductOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { id: rawId } = await params;
  const { status: statusFilter, page: rawPage } = await searchParams;

  const productId = Number(rawId);
  const page = Math.max(1, Number(rawPage ?? 1));
  const perPage = 5;

  if (isNaN(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, price: true, category: true },
  });

  if (!product) notFound();

  const where = {
    product_id: productId,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [orders, total, allStatuses] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { user: true },
    }),
    prisma.order.count({ where }),
    prisma.order.findMany({
      where: { product_id: productId },
      select: { status: true },
      distinct: ['status'],
    }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  function statusBadge(status: string | null) {
    const map: Record<string, string> = {
      pending: 'badge-yellow',
      completed: 'badge-green',
      cancelled: 'badge-red',
      processing: 'badge-blue',
    };
    return map[status?.toLowerCase() ?? ''] ?? 'badge-gray';
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/products">Products</Link>
        <span>→</span>
        <Link href={`/products/${productId}`}>{product.name}</Link>
        <span>→</span>
        <span className="breadcrumb-current">Orders</span>
      </div>

      {/* Cache banner */}
      <div className="cache-banner-yellow">
        <span>⚡ revalidate: 10s — orders update frequently</span>
        <span>Rendered at: {new Date().toLocaleTimeString('en-GB')}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{product.name} Orders</div>
          <div className="page-subtitle">
            {total} orders total · page {page} of {Math.max(1, totalPages)}
          </div>
        </div>

        {/* Status filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link
            href={`/products/${productId}/orders`}
            className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-ghost'}`}
          >
            All
          </Link>
          {allStatuses.map(({ status }) => (
            <Link
              key={status}
              href={`/products/${productId}/orders?status=${status}`}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-ghost'}`}
            >
              {status}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">No orders found</div>
                  </td>
                </tr>
              ) : orders.map(order => (
                <tr key={order.id}>
                  <td style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    #{order.id}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {order.user?.name ?? '—'}
                  </td>
                  <td>{order.quantity ?? '—'}</td>
                  <td style={{ color: 'var(--accent2)', fontWeight: 600 }}>
                    ₹{Number(order.total_price ?? 0).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${statusBadge(order.status)}`}>
                      {order.status ?? 'unknown'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>
                    {order.created_at
                      ? new Date(order.created_at).toLocaleDateString('en-GB')
                      : '—'}
                  </td>
                  <td>
                    <Link
                      href={`/products/${productId}/orders/${order.id}`}
                      style={{
                        color: 'var(--accent)', fontSize: 12,
                        textDecoration: 'none', fontWeight: 600,
                      }}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
            </div>
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={`/products/${productId}/orders?page=${p}${statusFilter ? `&status=${statusFilter}` : ''}`}
                  className={`pagination-btn ${page === p ? 'active' : ''}`}
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
