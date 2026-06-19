import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { id: true } });
  return products.map(p => ({ id: p.id.toString() }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const productId = Number(rawId);

  if (isNaN(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) notFound();

  const [orderCount, revenueResult] = await Promise.all([
    prisma.order.count({ where: { product_id: productId } }),
    prisma.order.aggregate({
      where: { product_id: productId, status: 'completed' },
      _sum: { total_price: true },
    }),
  ]);

  const revenue = Number(revenueResult._sum.total_price ?? 0);
  const price = Number(product.price);

  function stockBadge(stock: number | null) {
    if (!stock || stock === 0) return 'badge-red';
    if (stock < 10) return 'badge-yellow';
    return 'badge-green';
  }

  function stockLabel(stock: number | null) {
    if (!stock || stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/products">Products</Link>
        <span>→</span>
        <span className="breadcrumb-current">{product.name}</span>
      </div>
      
      {/* Cache banner */}
      <div className="cache-banner-green">
        <span>⚡ revalidate: 60s — product detail page</span>
        <span>Rendered at: {new Date().toLocaleTimeString('en-GB')}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">{product.name}</div>
          <div className="page-subtitle">
            {product.category ?? 'Uncategorised'}
          </div>
        </div>
        <span className={`badge ${stockBadge(product.stock)}`}>
          {stockLabel(product.stock)}
        </span>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Price', value: `₹${price.toLocaleString()}`, color: 'var(--accent2)' },
          { label: 'Stock', value: `${product.stock ?? 0} units`, color: 'var(--warning)' },
          { label: 'Total Orders', value: orderCount, color: 'var(--accent)' },
          { label: 'Revenue', value: `₹${revenue.toLocaleString()}`, color: '#00d4aa' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <div className="stat-card-label">{label}</div>
            <div className="stat-card-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Details card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="chart-title">Product Details</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: 20,
        }}>
          {[
            { label: 'Product ID', value: `#${product.id}` },
            { label: 'Name', value: product.name },
            { label: 'Price', value: `₹${price.toLocaleString()}` },
            { label: 'Category', value: product.category ?? '—' },
            { label: 'Stock', value: `${product.stock ?? 0} units` },
            {
              label: 'Added',
              value: product.created_at
                ? new Date(product.created_at).toLocaleDateString('en-GB')
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
        href={`/products/${product.id}/orders`}
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
