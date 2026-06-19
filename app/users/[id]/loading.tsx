export default function Loading() {
  function Skeleton({ w, h }: { w: number | string; h: number }) {
    return (
      <div style={{
        width: w, height: h,
        background: 'var(--surface2)',
        borderRadius: 6,
        animation: 'pulse 1.5s infinite',
      }} />
    );
  }

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {/* Breadcrumb skeleton */}
      <div style={{ marginBottom: 24 }}>
        <Skeleton w={120} h={14} />
      </div>

      {/* Cache banner skeleton */}
      <div style={{
        height: 36, marginBottom: 24,
        background: 'var(--surface2)',
        borderRadius: 7,
      }} />

      {/* Header skeleton */}
      <div style={{ marginBottom: 24 }}>
        <Skeleton w={200} h={28} />
        <div style={{ marginTop: 8 }}>
          <Skeleton w={160} h={16} />
        </div>
      </div>

      {/* Stats skeleton */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: 16, marginBottom: 24,
      }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <Skeleton w={60} h={10} />
            <div style={{ marginTop: 8 }}>
              <Skeleton w={80} h={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Details card skeleton */}
      <div className="card">
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton w={60} h={10} />
              <div style={{ marginTop: 8 }}>
                <Skeleton w={120} h={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
