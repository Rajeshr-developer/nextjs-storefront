'use client';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6c63ff', '#00d4aa', '#f5a623', '#ff4f4f', '#7b82a0'];

export default function DashboardCharts({
  ordersByStatus,
  ordersByDay,
}: {
  ordersByStatus: { status: string | null; _count: { status: number } }[];
  ordersByDay: { day: string; count: number }[];
}) {
  const pieData = ordersByStatus.map(s => ({
    name: s.status ?? 'unknown',
    value: s._count.status,
  }));

  const barData = ordersByDay.map(d => ({
    day: d.day,
    orders: Number(d.count),
  }));

  return (
    <div className="charts-grid">
      <div className="card">
        <div className="chart-title">Orders Last 7 Days</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <XAxis dataKey="day" tick={{ fill: '#7b82a0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#7b82a0', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a1d27', border: '1px solid #2e3350', borderRadius: 8 }}
              labelStyle={{ color: '#e8eaf0' }}
            />
            <Bar dataKey="orders" fill="#6c63ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="chart-title">Orders by Status</div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1a1d27', border: '1px solid #2e3350', borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#7b82a0' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
