'use client';
import { useRef, useState } from 'react';
import Nav from '@/components/Nav';

type AttachedFile = { id: string; name: string; mimeType: string; sizeBytes: number };
type Message = { id?: string; from: string; time: string; text: string; files?: AttachedFile[] };
type StatusData = { status: string; newsroom: string; messages: Message[] };

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StatusPage() {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [statusData, setStatusData] = useState<StatusData | null>(null);

  const [reply, setReply] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (reply.trim().length < 1 && replyFiles.length === 0) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append('code', code.trim());
      form.append('text', reply.trim() || '(File attachment)');
      form.append('sender', 'WHISTLEBLOWER');
      replyFiles.forEach(f => form.append('files', f));

      const res = await fetch('/api/messages', { method: 'POST', body: form });
      if (!res.ok) return;

      setStatusData(d => d ? {
        ...d,
        messages: [...d.messages, {
          from: 'whistleblower',
          time: 'Just now',
          text: reply.trim() || '(File attachment)',
          files: replyFiles.map(f => ({ id: '', name: f.name, mimeType: f.type, sizeBytes: f.size })),
        }],
      } : d);
      setReply(''); setReplyFiles([]); setSent(true);
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
        <div className="fade-in" style={{ maxWidth: 620, margin: '0 auto', padding: '96px 24px 80px' }}>

          {/* Case header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', marginBottom: 4, letterSpacing: '0.08em' }}>CASE CODE</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 500, color: 'var(--accent)', letterSpacing: '0.12em' }}>{code.toUpperCase()}</div>
            </div>
            <span className={`badge ${STATUS_BADGE[statusData.status] || 'badge-new'}`}>
              {STATUS_LABELS[statusData.status] || statusData.status}
            </span>
          </div>

          {/* Message thread */}
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

                <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: m.files && m.files.length > 0 ? 12 : 0 }}>
                  {m.text}
                </p>

                {/* File attachments on this message */}
                {m.files && m.files.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                    {m.files.map((f, fi) => (
                      <div key={fi} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                        gap: 12,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)' }}>
                            {f.mimeType.startsWith('image/') ? '🖼' : f.mimeType === 'application/pdf' ? '📄' : '📎'}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{formatBytes(f.sizeBytes)}</span>
                        </div>
                        {f.id && (
                          <a
                            href={`/api/status/files/${f.id}?code=${encodeURIComponent(code.trim())}`}
                            style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', textDecoration: 'none', flexShrink: 0 }}
                          >
                            Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reply box */}
          {!sent ? (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '20px' }}>
              <label className="field-label" style={{ marginBottom: 8, display: 'block' }}>Your reply</label>
              <textarea
                className="field-input"
                style={{ minHeight: 100, marginBottom: 12, resize: 'vertical' }}
                placeholder="Reply to the journalist's questions…"
                value={reply}
                onChange={e => setReply(e.target.value)}
              />

              {/* Attached files preview */}
              {replyFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                  {replyFiles.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 12px', background: 'rgba(200,146,74,0.06)',
                      border: '1px solid rgba(200,146,74,0.2)', gap: 10,
                    }}>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)' }}>{formatBytes(f.size)}</span>
                        <button
                          onClick={() => setReplyFiles(prev => prev.filter((_, j) => j !== i))}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, padding: '0 2px' }}
                        >✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    className="btn-ghost"
                    style={{ padding: '8px 14px', fontSize: 12 }}
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    + Attach file
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    style={{ display: 'none' }}
                    onChange={e => {
                      const picked = Array.from(e.target.files ?? []);
                      setReplyFiles(prev => [...prev, ...picked].slice(0, 5));
                      e.target.value = '';
                    }}
                  />
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)' }}>Max 5 files · 50 MB each</span>
                </div>
                <button
                  className="btn-primary"
                  style={{ padding: '9px 20px', fontSize: 13 }}
                  disabled={(reply.trim().length < 1 && replyFiles.length === 0) || sending}
                  onClick={handleReply}
                >
                  {sending ? 'Sending…' : 'Send Reply'}
                </button>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.6 }}>
                Never include your name or any identifying details. Metadata is stripped from all files automatically.
              </div>
            </div>
          ) : (
            <div style={{ padding: '16px 20px', border: '1px solid oklch(0.72 0.15 145 / 0.25)', fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--green)' }}>
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
          <input
            className="field-input"
            style={{ fontFamily: 'var(--mono)', letterSpacing: '0.1em', fontSize: 16 }}
            placeholder="word-word-word-word"
            value={code}
            onChange={e => { setCode(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleCheck()}
          />
        </div>
        {error && <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>{error}</div>}
        <button className="btn-primary" style={{ width: '100%' }} disabled={checking} onClick={handleCheck}>
          {checking ? 'Looking up…' : 'Check Status →'}
        </button>
      </div>
    </div>
  );
}
