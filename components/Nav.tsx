'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56,
        background: 'rgba(7,8,10,0.94)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--mono)', fontSize: 17, fontWeight: 500,
          letterSpacing: '0.2em', color: 'var(--text)', textDecoration: 'none',
        }}>LEAK</Link>

        {/* Desktop links */}
        <div className="nav-desktop-links" style={{ display: 'flex', gap: 8 }}>
          <Link href="/about"            className="btn-ghost" style={{ padding: '7px 16px' }}>About</Link>
          <Link href="/status"           className="btn-ghost" style={{ padding: '7px 16px' }}>Check Status</Link>
          <Link href="/journalist/login" className="btn-ghost" style={{ padding: '7px 16px' }}>Journalist Login</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span style={{ transform: open ? 'rotate(45deg) translateY(6.5px)' : 'none' }} />
          <span style={{ opacity: open ? 0 : 1 }} />
          <span style={{ transform: open ? 'rotate(-45deg) translateY(-6.5px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      <div className={`nav-mobile-menu${open ? ' open' : ''}`}>
        <Link href="/about"            onClick={() => setOpen(false)}>About</Link>
        <Link href="/status"           onClick={() => setOpen(false)}>Check Status</Link>
        <Link href="/journalist/login" onClick={() => setOpen(false)}>Journalist Login</Link>
      </div>
    </>
  );
}
