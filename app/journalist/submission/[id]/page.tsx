'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { STATUS_LABELS, STATUS_BADGE } from '@/lib/constants';

type Message = { id: string; from: string; time: string; text: string };
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

export default function SubmissionDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [sub, setSub] = useState<SubmissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
    if (reply.trim().length < 5) return;
    setSending(true);
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id, text: reply, sender: 'JOURNALIST' }),
      });
      setSub(d => d ? {
        ...d,
        messages: [...d.messages, { id: Date.now().toString(), from: 'journalist', time: 'Just now', text: reply }],
      } : d);
      setReply(''); setSent(true);
    } finally {
      setSending(false);
    }
  };

  const fmtSize = (b: number) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1e3).toFixed(0)} KB`;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
      Loading…
    </div>
  );
  if (!sub) return null;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,8,10,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', height: 56,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/journalist/dashboard" style={{
            background: 'none', border: 'none', color: 'var(--text-dim)',
            cursor: 'pointer', fontSize: 13, fontFamily: 'var(--sans)', textDecoration: 'none',
          }}>← Queue</Link>
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

      <div className="fade-in" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, alignItems: 'start' }}>
        {/* Left: content */}
        <div>
          {/* Meta */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
              {[
                { label: 'Category', value: sub.category },
                { label: 'State',    value: sub.state },
                { label: 'Files',    value: `${sub.files.length} file${sub.files.length !== 1 ? 's' : ''}` },
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

          {/* Files */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 16 }}>ATTACHED FILES</div>
            {sub.files.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No files attached.</p>
            )}
            {sub.files.map((f, i) => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: i < sub.files.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13 }}>{f.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {fmtSize(f.sizeBytes)} · Metadata stripped on receipt
                  </div>
                </div>
                <a href={`/api/journalist/files/${f.id}`} target="_blank" rel="noreferrer" style={{
                  background: 'none', border: '1px solid var(--border-strong)', color: 'var(--text-dim)',
                  padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)', textDecoration: 'none',
                }}>Download</a>
              </div>
            ))}
          </div>
        </div>

        {/* Right: messaging + audit */}
        <div style={{ position: 'sticky', top: 72 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>SECURE MESSAGE THREAD</div>
            </div>
            <div style={{ padding: '16px', maxHeight: 320, overflowY: 'auto' }}>
              {sub.messages.length === 0 && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No messages yet</div>
              )}
              {sub.messages.map((m, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
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
                </div>
              ))}
            </div>
            <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
              {sent && <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', marginBottom: 10 }}>✓ Message sent</div>}
              <textarea className="field-input" style={{ minHeight: 90, marginBottom: 10, fontSize: 13 }}
                placeholder="Request follow-up information from source…"
                value={reply}
                onChange={e => { setReply(e.target.value); setSent(false); }} />
              <button className="btn-primary" style={{ width: '100%', fontSize: 13 }}
                disabled={reply.trim().length < 5 || sending} onClick={sendReply}>
                {sending ? 'Sending…' : 'Send to Source'}
              </button>
              <div style={{ marginTop: 10, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Messages are E2E encrypted. This thread deletes after 90 days of inactivity.
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
