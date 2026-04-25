'use client';
import { useState } from 'react';
import Nav from '@/components/Nav';

const NEWSROOMS = ['Premium Times', 'TheCable', 'Peoples Gazette', 'HumAngle'] as const;

type Invite = { email: string; name: string; newsroom: string; sentAt: string };

export default function AdminPage() {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authChecking, setAuthChecking] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [newsroom, setNewsroom] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState<Invite[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!secret.trim()) { setAuthError('Enter the admin secret to continue.'); return; }
    setAuthChecking(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/invite', {
        headers: { 'x-admin-secret': secret },
      });
      if (res.ok) {
        setAuthed(true);
      } else {
        setAuthError('Incorrect admin secret.');
      }
    } catch {
      setAuthError('Could not reach the server. Try again.');
    } finally {
      setAuthChecking(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSending(true);
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret,
        },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), newsroom }),
      });

      const data = await res.json();

      if (res.status === 401) { setAuthed(false); setAuthError('Incorrect admin secret.'); return; }
      if (!res.ok) { setError(data.error ?? 'Failed to send invite.'); return; }

      setSent(prev => [{ email, name, newsroom, sentAt: new Date().toLocaleTimeString() }, ...prev]);
      setSuccessMsg(`Invite sent to ${email}`);
      setEmail(''); setName(''); setNewsroom('');
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Nav />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
          <div style={{ width: '100%', maxWidth: 380 }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.22em',
              color: 'var(--accent)', marginBottom: 16,
            }}>Admin Access</div>
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Journalist Admin</h1>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 28 }}>
              Enter the admin secret to access the journalist invite panel.
            </p>
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="field-label">Admin secret</label>
                <input
                  type="password"
                  className="field-input"
                  value={secret}
                  onChange={e => setSecret(e.target.value)}
                  placeholder="••••••••••••"
                  autoFocus
                />
                {authError && (
                  <div style={{ fontSize: 12, color: 'var(--red, #e05c5c)', marginTop: 6 }}>{authError}</div>
                )}
              </div>
              <button type="submit" className="btn-primary" disabled={authChecking}>
                {authChecking ? 'Verifying…' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin panel ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '100px 32px 64px', width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.22em',
            color: 'var(--accent)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              display: 'inline-block', width: 7, height: 7,
              background: 'var(--accent)', borderRadius: '50%',
              animation: 'beaconPulse 2.2s ease-in-out infinite',
            }} />
            Admin Panel
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 10 }}>
            Invite a Journalist
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.75, maxWidth: 500 }}>
            Enter the journalist's details below. They will receive an email with a secure
            link to set their own password. The link expires after <strong style={{ color: 'var(--text)' }}>48 hours</strong>.
          </p>
        </div>

        {/* Invite form */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderTop: '2px solid var(--accent)', padding: '32px',
          marginBottom: 32,
        }}>
          <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="field-label">Full name</label>
                <input
                  type="text"
                  className="field-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Amara Obi"
                  required
                />
              </div>
              <div>
                <label className="field-label">Email address</label>
                <input
                  type="email"
                  className="field-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="amara@newsroom.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label">Newsroom</label>
              <select
                className="field-input"
                value={newsroom}
                onChange={e => setNewsroom(e.target.value)}
                required
              >
                <option value="">Select a newsroom…</option>
                {NEWSROOMS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {error && (
              <div style={{
                padding: '12px 16px', background: 'rgba(224,92,92,0.08)',
                border: '1px solid rgba(224,92,92,0.25)',
                fontSize: 13, color: 'var(--red, #e05c5c)', lineHeight: 1.6,
              }}>
                {error}
              </div>
            )}

            {successMsg && (
              <div style={{
                padding: '12px 16px', background: 'rgba(122,184,122,0.08)',
                border: '1px solid rgba(122,184,122,0.25)',
                fontSize: 13, color: 'var(--green)', lineHeight: 1.6,
                fontFamily: 'var(--mono)', letterSpacing: '0.04em',
              }}>
                ✓ {successMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={sending}
              style={{ alignSelf: 'flex-start', padding: '12px 32px', opacity: sending ? 0.6 : 1 }}
            >
              {sending ? 'Sending invite…' : 'Send invite email'}
            </button>
          </form>
        </div>

        {/* Sent log */}
        {sent.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                INVITES SENT THIS SESSION
              </div>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sent.map((inv, i) => (
                <div key={i} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  padding: '14px 20px',
                  display: 'grid', gridTemplateColumns: '1fr 1fr auto',
                  alignItems: 'center', gap: 16,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{inv.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{inv.email}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>{inv.newsroom}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--green)', letterSpacing: '0.08em' }}>
                    ✓ {inv.sentAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
