import Link from 'next/link';

export default function OrderNotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 16, textAlign: 'center',
    }}>
      <div style={{ fontSize: 64 }}>🛒</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>Order Not Found</div>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>
        This order doesn't exist or doesn't belong to this user
      </div>
      <Link
        href="/orders"
        style={{
          padding: '10px 20px', background: 'var(--accent)',
          color: 'white', borderRadius: 7,
          textDecoration: 'none', fontSize: 13, fontWeight: 600,
        }}
      >
        ← Back to Orders
      </Link>
    </div>
  );
}
