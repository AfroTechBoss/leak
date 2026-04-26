'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { STATUS_LABELS, STATUS_BADGE } from '@/lib/constants';

type AttachedFile = { id: string; name: string; mimeType: string; sizeBytes: number };
type Message = { id: string; from: string; time: string; text: string; files?: AttachedFile[] };
type FileRecord = { id: string; name: string; mimeType: string; sizeBytes: number };
type AuditEntry = { action: string; time: string };
type SubmissionDetail = {
  id: string;
  caseCodePreview: string;
  category: string;
  state: string;
  status: string;
  newsroom: string;
  description: string;
  files: FileRecord[];
  messages: Message[];
  auditLog: AuditEntry[];
  createdAt: string;
};

const STATUSES = ['NEW', 'UNDER_REVIEW', 'INVESTIGATION_OPENED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'];

const fmtSize = (b: number) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : b > 1e3 ? `${(b / 1e3).toFixed(0)} KB` : `${b} B`;
const fileIcon = (mime: string) => mime.startsWith('image/') ? '🖼' : mime === 'application/pdf' ? '📄' : '📎';

export default function SubmissionDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [sub, setSub] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [reply, setReply] = useState('');
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/journalist/submission/${id}`)
      .then(r => { if (r.status === 401) { router.push('/journalist/login'); throw new Error(); } return r.json(); })
      .then(data => { setSub(data); setStatus(data.status); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, router]);

  const updateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    setStatus(newStatus);
    try {
      await fetch(`/api/journalist/submission/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const sendReply = async () => {
    if (reply.trim().length < 1 && replyFiles.length === 0) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append('submissionId', id);
      form.append('text', reply.trim() || '(File attachment)');
      form.append('sender', 'JOURNALIST');
      replyFiles.forEach(f => form.append('files', f));

      const res = await fetch('/api/messages', { method: 'POST', body: form });
      if (!res.ok) return;

      setSub(d => d ? {
        ...d,
        messages: [...d.messages, {
          id: Date.now().toString(),
          from: 'journalist',
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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
      Loading…
    </div>
  );
  if (!sub) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,8,10,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/journalist/dashboard" style={{ color: 'var(--text-dim)', cursor: 'pointer', fontSize: 13, textDecoration: 'none' }}>← Queue</Link>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--accent)', letterSpacing: '0.08em' }}>{sub.caseCodePreview}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>STATUS</span>
          <select className="field-input" style={{ width: 'auto', padding: '7px 32px 7px 12px', fontSize: 13, opacity: updatingStatus ? 0.6 : 1 }}
            value={status} onChange={e => updateStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      <div className="fade-in sub-layout" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px' }}>

        {/* Left: submission content */}
        <div>
          {/* Meta */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: 20 }}>
            <div className="sub-meta-grid">
              {[
                { label: 'Category', value: sub.category },
                { label: 'State',    value: sub.state },
                { label: 'Evidence', value: `${sub.files.length} file${sub.files.length !== 1 ? 's' : ''}` },
                { label: 'Partner',  value: sub.newsroom },
              ].map((row, i) => (
                <div key={i} style={{ padding: '16px 20px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 6 }}>{row.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 16 }}>WHISTLEBLOWER ACCOUNT</div>
            <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.85 }}>{sub.description || 'No description provided.'}</p>
          </div>

          {/* Initial evidence files */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 16 }}>INITIAL EVIDENCE FILES</div>
            {sub.files.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No files attached to original submission.</p>
            )}
            {sub.files.map((f, i) => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: i < sub.files.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14 }}>{fileIcon(f.mimeType)}</span>
                  <div>
                    <div style={{ fontSize: 13 }}>{f.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {fmtSize(f.sizeBytes)} · Metadata stripped
                    </div>
                  </div>
                </div>
                <a href={`/api/journalist/files/${f.id}`} target="_blank" rel="noreferrer" style={{
                  border: '1px solid var(--border-strong)', color: 'var(--text-dim)',
                  padding: '6px 14px', fontSize: 12, textDecoration: 'none',
                }}>Download</a>
              </div>
            ))}
          </div>
        </div>

        {/* Right: messaging + audit */}
        <div className="sub-sidebar">
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>SECURE MESSAGE THREAD</div>
            </div>

            {/* Messages */}
            <div style={{ padding: '16px', maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {sub.messages.length === 0 && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No messages yet</div>
              )}
              {sub.messages.map((m, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: m.from === 'journalist' ? 'var(--accent)' : 'var(--text-dim)', letterSpacing: '0.06em' }}>
                      {m.from === 'journalist' ? 'YOU' : 'SOURCE'}
                    </span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)' }}>{m.time}</span>
                  </div>
                  <div style={{
                    fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7, padding: '12px 14px',
                    background: m.from === 'journalist' ? 'var(--accent-dim)' : 'var(--bg-raised)',
                    border: `1px solid ${m.from === 'journalist' ? 'var(--accent-border)' : 'var(--border)'}`,
                  }}>{m.text}</div>

                  {/* Message attachments */}
                  {m.files && m.files.length > 0 && (
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {m.files.map((f, fi) => (
                        <div key={fi} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '7px 10px', background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border)', gap: 8,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <span style={{ fontSize: 12 }}>{fileIcon(f.mimeType)}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{fmtSize(f.sizeBytes)}</span>
                          </div>
                          {f.id && (
                            <a href={`/api/journalist/files/${f.id}`} target="_blank" rel="noreferrer"
                              style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', textDecoration: 'none', flexShrink: 0 }}>
                              ↓
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
            <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
              {sent && <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', marginBottom: 10 }}>✓ Sent</div>}
              <textarea
                className="field-input"
                style={{ minHeight: 80, marginBottom: 8, fontSize: 13 }}
                placeholder="Request follow-up information from source…"
                value={reply}
                onChange={e => { setReply(e.target.value); setSent(false); }}
              />

              {/* Attached file list */}
              {replyFiles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                  {replyFiles.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', background: 'rgba(200,146,74,0.05)',
                      border: '1px solid rgba(200,146,74,0.2)', fontSize: 11, gap: 8,
                    }}>
                      <span style={{ color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)' }}>{fmtSize(f.size)}</span>
                        <button onClick={() => setReplyFiles(p => p.filter((_, j) => j !== i))}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn-ghost"
                  style={{ padding: '8px 12px', fontSize: 12, flexShrink: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  title="Attach file"
                >
                  📎
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
                <button
                  className="btn-primary"
                  style={{ flex: 1, fontSize: 13 }}
                  disabled={(reply.trim().length < 1 && replyFiles.length === 0) || sending}
                  onClick={sendReply}
                >
                  {sending ? 'Sending…' : 'Send to Source'}
                </button>
              </div>
              <div style={{ marginTop: 8, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                E2E encrypted · Metadata stripped from files
              </div>
            </div>
          </div>

          {/* Audit log */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', marginTop: 12, padding: '16px 20px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 14 }}>AUDIT LOG</div>
            {sub.auditLog.map((e, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{e.action}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 12 }}>{e.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
