import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Shorter cache — orders change more frequently
export const revalidate = 10;

export default async function UserOrdersPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { status?: string; page?: string };
}) {
  const id = await params;
  const userId = Number(id.id);
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const statusFilter = searchParams.status;
  const perPage = 5;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) notFound();

  const where = {
    user_id: userId,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { product: true },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  const allStatuses = await prisma.order.findMany({
    where: { user_id: userId },
    select: { status: true },
    distinct: ['status'],
  });

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
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        marginBottom: 24, fontSize: 13, color: 'var(--muted)',
      }}>
        <Link href="/users" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          Users
        </Link>
        <span>→</span>
        <Link
          href={`/users/${userId}`}
          style={{ color: 'var(--muted)', textDecoration: 'none' }}
        >
          {user.name}
        </Link>
        <span>→</span>
        <span style={{ color: 'var(--text)' }}>Orders</span>
      </div>

      {/* Cache info */}
      <div style={{
        padding: '8px 14px', marginBottom: 24,
        background: 'rgba(245,166,35,0.1)',
        border: '1px solid rgba(245,166,35,0.2)',
        borderRadius: 7, fontSize: 12, color: '#f5a623',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>⚡ revalidate: 10s — orders update frequently</span>
        <span>Rendered at: {new Date().toLocaleTimeString('en-GB')}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{user.name}'s Orders</div>
          <div className="page-subtitle">
            {total} orders total — page {page} of {totalPages}
          </div>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href={`/users/${userId}/orders`}
            style={{
              padding: '6px 12px', borderRadius: 6,
              background: !statusFilter ? 'var(--accent)' : 'var(--surface2)',
              color: !statusFilter ? 'white' : 'var(--muted)',
              textDecoration: 'none', fontSize: 12, fontWeight: 600,
              border: '1px solid var(--border)',
            }}
          >
            All
          </Link>
          {allStatuses.map(({ status }) => (
            <Link
              key={status}
              href={`/users/${userId}/orders?status=${status}`}
              style={{
                padding: '6px 12px', borderRadius: 6,
                background: statusFilter === status ? 'var(--accent)' : 'var(--surface2)',
                color: statusFilter === status ? 'white' : 'var(--muted)',
                textDecoration: 'none', fontSize: 12, fontWeight: 600,
                border: '1px solid var(--border)',
              }}
            >
              {status}
            </Link>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
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
                    {order.product?.name ?? '—'}
                  </td>
                  <td>{order.quantity ?? '—'}</td>
                  <td style={{ color: '#00d4aa', fontWeight: 600 }}>
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
                      href={`/users/${userId}/orders/${order.id}`}
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
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 20, paddingTop: 16,
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={`/users/${userId}/orders?page=${p}${statusFilter ? `&status=${statusFilter}` : ''}`}
                  style={{
                    padding: '5px 10px', borderRadius: 6,
                    background: page === p ? 'var(--accent)' : 'var(--surface2)',
                    color: page === p ? 'white' : 'var(--muted)',
                    textDecoration: 'none', fontSize: 12, fontWeight: 600,
                    border: '1px solid var(--border)',
                  }}
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
