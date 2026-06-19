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

      <div style={{ marginBottom: 24 }}>
        <Skeleton w={200} h={14} />
      </div>

      <div style={{ height: 36, marginBottom: 24, background: 'var(--surface2)', borderRadius: 7 }} />

      <div style={{ marginBottom: 24 }}>
        <Skeleton w={200} h={28} />
        <div style={{ marginTop: 8 }}><Skeleton w={160} h={16} /></div>
      </div>

      <div className="card">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: 'repeat(7,1fr)',
            gap: 16, padding: '14px 0',
            borderBottom: '1px solid var(--border)',
          }}>
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} w="80%" h={16} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
