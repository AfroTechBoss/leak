'use client';
import Link from 'next/link';

export default function Nav() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 56,
      background: 'rgba(7,8,10,0.94)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <Link href="/" style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'var(--mono)', fontSize: 17, fontWeight: 500,
        letterSpacing: '0.2em', color: 'var(--text)', textDecoration: 'none',
      }}>LEAK</Link>
      <div style={{ display: 'flex', gap: 8 }}>
        <Link href="/status" className="btn-ghost" style={{ padding: '7px 16px' }}>Check Status</Link>
        <Link href="/journalist/login" className="btn-ghost" style={{ padding: '7px 16px' }}>Journalist Login</Link>
      </div>
    </nav>
  );
}
