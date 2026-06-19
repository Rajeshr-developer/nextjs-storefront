// app/login/page.tsx
'use client'
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/';
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    // Set a mock auth cookie
    document.cookie = 'auth_token=mock_token_123; path=/; max-age=86400';
    router.push(from); // redirect back to where they came from
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg)'
    }}>
      <div className="card" style={{ width: 360 }}>
        <div className="modal-title">Sign In</div>
        <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 13 }}>
          {from !== '/' ? `You need to login to access ${from}` : 'Welcome back'}
        </p>
        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In (Mock)'}
        </button>
      </div>
    </div>
  );
}