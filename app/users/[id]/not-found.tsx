import Link from 'next/link';

export default function UserNotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: 16, textAlign: 'center',
    }}>
      <div style={{ fontSize: 64 }}>👤</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>User Not Found</div>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>
        This user doesn't exist or has been deleted
      </div>
      <Link
        href="/users"
        style={{
          padding: '10px 20px', background: 'var(--accent)',
          color: 'white', borderRadius: 7,
          textDecoration: 'none', fontSize: 13, fontWeight: 600,
        }}
      >
        ← Back to Users
      </Link>
    </div>
  );
}
