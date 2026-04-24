'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JournalistLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !pass) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/journalist/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      if (!res.ok) { setError('Invalid credentials.'); return; }
      router.push('/journalist/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 20, letterSpacing: '0.18em', marginBottom: 8 }}>LEAK</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.12em' }}>JOURNALIST PORTAL</div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', padding: '36px 32px' }}>
          <div style={{ marginBottom: 20 }}>
            <label className="field-label">Email</label>
            <input className="field-input" type="email" placeholder="you@premiumtimes.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label className="field-label">Password</label>
            <input className="field-input" type="password" placeholder="••••••••••••"
              value={pass} onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
          {error && <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)', marginBottom: 16 }}>{error}</div>}
          <button className="btn-primary" style={{ width: '100%' }}
            onClick={handleLogin} disabled={loading || !email || !pass}>
            {loading ? 'Authenticating…' : 'Sign in →'}
          </button>
        </div>

        <div style={{ marginTop: 20, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
          Access is restricted to verified journalists at partner organisations.<br />Contact your editor to request credentials.
        </div>

        <Link href="/" style={{
          display: 'block', margin: '24px auto 0', background: 'none', border: 'none',
          color: 'var(--text-dim)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--sans)',
          textAlign: 'center', textDecoration: 'none',
        }}>
          ← Return to submission portal
        </Link>
      </div>
    </div>
  );
}
