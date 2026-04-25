'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Nav from '@/components/Nav';

type InviteInfo = { name: string; email: string; newsroom: string };
type PageState = 'loading' | 'ready' | 'invalid' | 'expired' | 'used' | 'success';

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`/api/journalist/invite?token=${token}`)
      .then(r => {
        if (r.status === 404) { setPageState('invalid'); return null; }
        if (r.status === 410) {
          r.json().then(d => setPageState(d.error?.includes('used') ? 'used' : 'expired'));
          return null;
        }
        if (!r.ok) { setPageState('invalid'); return null; }
        return r.json();
      })
      .then(data => {
        if (data) { setInvite(data); setPageState('ready'); }
      })
      .catch(() => setPageState('invalid'));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 12) { setError('Password must be at least 12 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/journalist/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setPageState('success');
        setTimeout(() => router.push('/journalist/login'), 2500);
      } else {
        const d = await res.json();
        setError(d.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const strength = (() => {
    if (password.length === 0) return null;
    const checks = [password.length >= 12, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
    const score = checks.filter(Boolean).length;
    if (score <= 1) return { label: 'Weak', color: 'var(--red, #e05c5c)' };
    if (score === 2) return { label: 'Fair', color: '#c8924a' };
    if (score === 3) return { label: 'Good', color: '#7ab87a' };
    return { label: 'Strong', color: 'var(--green)' };
  })();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Loading */}
          {pageState === 'loading' && (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.08em' }}>
              Verifying invite…
            </div>
          )}

          {/* Invalid */}
          {(pageState === 'invalid') && (
            <StatusCard
              accent="var(--red, #e05c5c)"
              icon="✕"
              title="Invalid invite"
              body="This invite link is not valid. It may have been typed incorrectly or the link may be corrupted."
              action={{ label: 'Back to home', href: '/' }}
            />
          )}

          {/* Expired */}
          {pageState === 'expired' && (
            <StatusCard
              accent="#c8924a"
              icon="⏱"
              title="Invite expired"
              body="This invite link has expired. Invite links are valid for 48 hours. Ask your administrator to send a new one."
              action={{ label: 'Back to home', href: '/' }}
            />
          )}

          {/* Already used */}
          {pageState === 'used' && (
            <StatusCard
              accent="var(--green)"
              icon="✓"
              title="Already accepted"
              body="This invite has already been used to create an account. If you need to log in, use the journalist login page."
              action={{ label: 'Go to login', href: '/journalist/login' }}
            />
          )}

          {/* Success */}
          {pageState === 'success' && (
            <StatusCard
              accent="var(--green)"
              icon="✓"
              title="Account created"
              body={`Welcome to LEAK, ${invite?.name}. Your account is ready. Redirecting you to login…`}
            />
          )}

          {/* Ready — show form */}
          {pageState === 'ready' && invite && (
            <div>
              {/* Header */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
                  letterSpacing: '0.22em', color: 'var(--accent)', marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{
                    display: 'inline-block', width: 7, height: 7,
                    background: 'var(--accent)', borderRadius: '50%',
                    animation: 'beaconPulse 2.2s ease-in-out infinite',
                  }} />
                  Journalist Invite
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 10 }}>
                  Welcome, {invite.name}.
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.75 }}>
                  You have been invited to join LEAK as a journalist for{' '}
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{invite.newsroom}</span>.
                  Set a password below to activate your account.
                </p>
              </div>

              {/* Info card */}
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                padding: '16px 20px', marginBottom: 28,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>EMAIL</div>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{invite.email}</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 4 }}>NEWSROOM</div>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{invite.newsroom}</div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="field-label">Password</label>
                  <input
                    type="password"
                    className="field-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 12 characters"
                    required
                    autoFocus
                  />
                  {strength && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
                    }}>
                      <div style={{ flex: 1, height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: strength.label === 'Weak' ? '25%' : strength.label === 'Fair' ? '50%' : strength.label === 'Good' ? '75%' : '100%',
                          background: strength.color,
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: strength.color, letterSpacing: '0.08em', minWidth: 44 }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.6 }}>
                    Use 12+ characters. Mix uppercase, numbers, and symbols for a stronger password.
                  </div>
                </div>

                <div>
                  <label className="field-label">Confirm password</label>
                  <input
                    type="password"
                    className="field-input"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    style={{ borderColor: confirm && confirm !== password ? 'var(--red, #e05c5c)' : undefined }}
                  />
                  {confirm && confirm !== password && (
                    <div style={{ fontSize: 11, color: 'var(--red, #e05c5c)', marginTop: 6 }}>Passwords do not match.</div>
                  )}
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

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{ marginTop: 8, opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? 'Creating account…' : 'Activate account'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  accent, icon, title, body, action,
}: {
  accent: string;
  icon: string;
  title: string;
  body: string;
  action?: { label: string; href: string };
}) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderTop: `2px solid ${accent}`,
      padding: '40px 36px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 16, color: accent }}>{icon}</div>
      <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 12 }}>{title}</h2>
      <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: action ? 28 : 0 }}>{body}</p>
      {action && (
        <a href={action.href} className="btn-ghost" style={{ padding: '10px 24px', fontSize: 13 }}>
          {action.label}
        </a>
      )}
    </div>
  );
}
