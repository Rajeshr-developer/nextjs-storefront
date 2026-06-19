import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Cache for 60 seconds — profile rarely changes
export const revalidate = 60;

export async function generateStaticParams() {
  const users = await prisma.user.findMany({ select: { id: true } });
  return users.map(u => ({ id: u.id.toString() }));
}

export default async function UserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: rawId } = await params; // await first
  const id = Number(rawId);
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (isNaN(id)) notFound();

  if (!user) notFound();

  const orderCount = await prisma.order.count({
    where: { user_id: user.id },
  });

  const revenueResult = await prisma.order.aggregate({
    where: { user_id: user.id, status: 'completed' },
    _sum: { total_price: true },
  });

  const revenue = Number(revenueResult._sum.total_price ?? 0);

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        marginBottom: 24, fontSize: 13, color: 'var(--muted)'
      }}>
        <Link href="/users" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          Users
        </Link>
        <span>→</span>
        <span style={{ color: 'var(--text)' }}>{user.name}</span>
      </div>

      {/* Cache info */}
      <div style={{
        padding: '8px 14px', marginBottom: 24,
        background: 'rgba(0,212,170,0.1)',
        border: '1px solid rgba(0,212,170,0.2)',
        borderRadius: 7, fontSize: 12, color: '#00d4aa',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>⚡ revalidate: 60s — user detail page</span>
        <span>Rendered at: {new Date().toLocaleTimeString('en-GB')}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{user.name}</div>
          <div className="page-subtitle">{user.email}</div>
        </div>
        <span className={`badge ${user.active ? 'badge-green' : 'badge-gray'}`}>
          {user.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: 16, marginBottom: 24,
      }}>
        {[
          { label: 'User ID', value: `#${user.id}`, color: 'var(--accent)' },
          { label: 'Role', value: user.role ?? '—', color: 'var(--text)' },
          { label: 'Total Orders', value: orderCount, color: '#f5a623' },
          { label: 'Revenue', value: `₹${revenue.toLocaleString()}`, color: '#00d4aa' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <div style={{
              color: 'var(--muted)', fontSize: 11,
              fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.5px', marginBottom: 8,
            }}>
              {label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Details card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="chart-title">Profile Details</div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20
        }}>
          {[
            { label: 'Full Name', value: user.name },
            { label: 'Email', value: user.email },
            { label: 'Age', value: user.age ?? '—' },
            { label: 'Role', value: user.role ?? '—' },
            { label: 'Status', value: user.active ? 'Active' : 'Inactive' },
            {
              label: 'Member Since',
              value: user.created_at
                ? new Date(user.created_at).toLocaleDateString('en-GB')
                : '—',
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{
                color: 'var(--muted)', fontSize: 11,
                fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.5px', marginBottom: 4,
              }}>
                {label}
              </div>
              <div style={{ fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      <Link
        href={`/users/${user.id}/orders`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: 'var(--accent)',
          color: 'white', borderRadius: 7,
          textDecoration: 'none', fontSize: 13, fontWeight: 600,
        }}
      >
        View {orderCount} Orders →
      </Link>
    </div>
  );
}
