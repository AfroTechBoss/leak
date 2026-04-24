'use client';
import { useState } from 'react';
import Nav from '@/components/Nav';

type Message = { from: string; time: string; text: string };
type StatusData = {
  status: string;
  newsroom: string;
  messages: Message[];
};

export default function StatusPage() {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleCheck = async () => {
    const val = code.trim();
    if (val.length < 4) { setError('Please enter a valid Case Code.'); return; }
    setChecking(true); setError('');
    try {
      const res = await fetch(`/api/status?code=${encodeURIComponent(val)}`);
      if (res.status === 404) { setError('No submission found with that code. Check for typos and try again.'); return; }
      if (!res.ok) throw new Error();
      setStatusData(await res.json());
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleReply = async () => {
    if (reply.trim().length < 5) return;
    setSending(true);
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), text: reply, sender: 'WHISTLEBLOWER' }),
      });
      setStatusData(d => d ? {
        ...d,
        messages: [...d.messages, { from: 'whistleblower', time: 'Just now', text: reply }],
      } : d);
      setReply(''); setSent(true);
    } finally {
      setSending(false);
    }
  };

  const STATUS_BADGE: Record<string, string> = {
    NEW: 'badge-new', UNDER_REVIEW: 'badge-review',
    INVESTIGATION_OPENED: 'badge-open', PUBLISHED: 'badge-published',
    REJECTED: 'badge-rejected', ARCHIVED: 'badge-archived',
  };
  const STATUS_LABELS: Record<string, string> = {
    NEW: 'New', UNDER_REVIEW: 'Under Review',
    INVESTIGATION_OPENED: 'Investigation Opened', PUBLISHED: 'Published',
    REJECTED: 'Rejected', ARCHIVED: 'Archived',
  };

  if (statusData) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Nav />
        <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto', padding: '96px 24px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, letterSpacing: '0.08em' }}>CASE CODE</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.12em' }}>{code.toUpperCase()}</div>
            </div>
            <span className={`badge ${STATUS_BADGE[statusData.status] || 'badge-new'}`}>
              {STATUS_LABELS[statusData.status] || statusData.status}
            </span>
          </div>

          <div style={{ marginBottom: 20 }}>
            {statusData.messages.map((m, i) => (
              <div key={i} style={{
                background: m.from === 'system' ? 'transparent' : 'var(--bg-card)',
                border: `1px solid ${m.from === 'system' ? 'var(--border)' : 'var(--border-strong)'}`,
                padding: '18px 20px', marginBottom: 10,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', color: m.from === 'journalist' ? 'var(--accent)' : 'var(--text-dim)' }}>
                    {m.from === 'system' ? 'SYSTEM' : m.from === 'journalist' ? `JOURNALIST · ${statusData.newsroom}` : 'YOU'}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)' }}>{m.time}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{m.text}</p>
              </div>
            ))}
          </div>

          {!sent ? (
            <div>
              <label className="field-label">Your reply</label>
              <textarea className="field-input" style={{ minHeight: 120, marginBottom: 12 }}
                placeholder="Reply to the journalist's questions…"
                value={reply} onChange={e => setReply(e.target.value)} />
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>Messages delete after 90 days of inactivity. Never include your name.</div>
                <button className="btn-primary" disabled={reply.trim().length < 5 || sending} onClick={handleReply}>
                  {sending ? 'Sending…' : 'Send Reply'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--green-dim)', border: '1px solid oklch(0.72 0.15 145 / 0.25)', padding: '16px 20px', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--green)' }}>
              ✓ Reply sent. The journalist will respond within 72 hours.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav />
      <div className="fade-in" style={{ maxWidth: 460, margin: '0 auto', padding: '120px 24px 80px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>Check case status</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 40 }}>Enter your Case Code to read messages from your assigned journalist.</p>
        <div style={{ marginBottom: 8 }}>
          <label className="field-label">Case Code</label>
          <input className="field-input" style={{ fontFamily: 'var(--mono)', letterSpacing: '0.1em', fontSize: 16 }}
            placeholder="word-word-word-word"
            value={code}
            onChange={e => { setCode(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleCheck()} />
        </div>
        {error && <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>{error}</div>}
        <button className="btn-primary" style={{ width: '100%' }} disabled={checking} onClick={handleCheck}>
          {checking ? 'Looking up…' : 'Check Status →'}
        </button>
      </div>
    </div>
  );
}
