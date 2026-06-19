import { prisma } from '@/lib/prisma';
import DashboardCharts from '@/components/DashboardCharts';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';

async function getStats() {
  const [userCount, productCount, orderCount, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total_price: true } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: { user: true, product: true },
  });

  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    _count: { status: true },
  });

  const ordersByDay = await prisma.$queryRaw<{ day: string; count: number }[]>`
    SELECT TO_CHAR(created_at, 'Mon DD') as day, COUNT(*)::int as count
    FROM orders
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY TO_CHAR(created_at, 'Mon DD'), DATE(created_at)
    ORDER BY DATE(created_at)
  `;

  return { userCount, productCount, orderCount, revenue, recentOrders, ordersByStatus, ordersByDay };
}

function statusBadge(status: string | null) {
  const map: Record<string, string> = {
    pending: 'badge-yellow',
    completed: 'badge-green',
    cancelled: 'badge-red',
    processing: 'badge-blue',
  };
  return map[status?.toLowerCase() ?? ''] ?? 'badge-gray';
}

export default async function DashboardPage() {
  const { userCount, productCount, orderCount, revenue, recentOrders, ordersByStatus, ordersByDay } = await getStats();

  const stats = [
    { label: 'Total Users', value: userCount, icon: Users, color: '#6c63ff', sub: 'Registered accounts' },
    { label: 'Products', value: productCount, icon: Package, color: '#00d4aa', sub: 'In catalogue' },
    { label: 'Orders', value: orderCount, icon: ShoppingCart, color: '#f5a623', sub: 'All time' },
    { label: 'Revenue', value: `₹${Number(revenue._sum.total_price ?? 0).toLocaleString()}`, icon: DollarSign, color: '#ff4f4f', sub: 'Total earned' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Overview of your store</div>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <div className="stat-card" key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ color }}>{value}</div>
                <div className="stat-sub">{sub}</div>
              </div>
              <div style={{ background: `${color}20`, borderRadius: 8, padding: 10 }}>
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <DashboardCharts ordersByStatus={ordersByStatus} ordersByDay={ordersByDay} />

      <div className="card" style={{ marginTop: 24 }}>
        <div className="chart-title">Recent Orders</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ color: 'var(--accent)', fontWeight: 600 }}>#{order.id}</td>
                  <td>{order.user?.name ?? '—'}</td>
                  <td>{order.product?.name ?? '—'}</td>
                  <td>{order.quantity ?? '—'}</td>
                  <td>₹{Number(order.total_price ?? 0).toLocaleString()}</td>
                  <td><span className={`badge ${statusBadge(order.status)}`}>{order.status ?? 'unknown'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
