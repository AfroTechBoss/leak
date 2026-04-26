'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { STATUS_LABELS, STATUS_BADGE } from '@/lib/constants';

type Submission = {
  id: string;
  caseCodePreview: string;
  category: string;
  state: string;
  status: string;
  fileCount: number;
  newsroom: string;
  createdAt: string;
  preview: string;
};

type Stats = { new: number; underReview: number; total: number; published: number };

const STATUSES = ['All', 'NEW', 'UNDER_REVIEW', 'INVESTIGATION_OPENED', 'PUBLISHED', 'REJECTED'];

export default function JournalistDashboardPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<Stats>({ new: 0, underReview: 0, total: 0, published: 0 });
  const [filter, setFilter] = useState('All');
  const [journalist, setJournalist] = useState<{ name: string; newsroom: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/journalist/submissions')
      .then(r => { if (r.status === 401) { router.push('/journalist/login'); throw new Error('Unauth'); } return r.json(); })
      .then(data => { setSubmissions(data.submissions); setStats(data.stats); setJournalist(data.journalist); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = filter === 'All' ? submissions : submissions.filter(s => s.status === filter);

  const signOut = async () => {
    await fetch('/api/journalist/auth', { method: 'DELETE' });
    router.push('/journalist/login');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>
      Loading…
    </div>
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(7,8,10,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div className="dash-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 56 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 16, letterSpacing: '0.18em' }}>LEAK</div>
            <div className="dash-journalist-info" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>JOURNALIST DASHBOARD</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {journalist && (
              <span className="dash-journalist-info" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)' }}>
                {journalist.name} · {journalist.newsroom}
              </span>
            )}
            <button onClick={signOut} style={{
              background: 'none', border: '1px solid var(--border)', padding: '6px 14px',
              color: 'var(--text-dim)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)',
            }}>Sign out</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }} className="page-pad">
        {/* Stats */}
        <div className="fade-in dash-stats-grid" style={{ marginTop: 32, marginBottom: 32 }}>
          {[
            { label: 'New',              value: stats.new,        color: 'var(--accent)' },
            { label: 'Under Review',     value: stats.underReview, color: 'var(--blue)' },
            { label: 'Total this month', value: stats.total,       color: 'var(--text)' },
            { label: 'Published',        value: stats.published,   color: 'var(--green)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', padding: '24px 28px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 32, fontWeight: 500, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              background: filter === s ? 'var(--accent)' : 'transparent',
              color: filter === s ? '#07080a' : 'var(--text-dim)',
              border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border-strong)'}`,
              padding: '7px 14px', fontSize: 12, cursor: 'pointer',
              fontFamily: 'var(--sans)', fontWeight: filter === s ? 600 : 400,
              transition: 'all 0.15s',
            }}>{s === 'All' ? 'All' : STATUS_LABELS[s]}</button>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="dash-table-header">
            {['Case Code', 'Category', 'State', 'Date', 'Preview', 'Status'].map(h => (
              <div key={h} style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--text-dim)' }}>{h}</div>
            ))}
          </div>
          {filtered.map(sub => (
            <Link key={sub.id} href={`/journalist/submission/${sub.id}`}
              className="dash-table-row"
            >
              <div className="dash-cell-case" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', letterSpacing: '0.05em' }}>{sub.caseCodePreview}</div>
              <div className="dash-cell-cat" style={{ fontSize: 13, color: 'var(--text)', paddingRight: 8 }}>{sub.category}</div>
              <div className="dash-cell-state" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)' }}>{sub.state}</div>
              <div className="dash-cell-date" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)' }}>
                {new Date(sub.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <div className="dash-cell-preview" style={{ fontSize: 13, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 16 }}>{sub.preview}</div>
              <div className="dash-cell-status"><span className={`badge ${STATUS_BADGE[sub.status] || 'badge-new'}`}>{STATUS_LABELS[sub.status] || sub.status}</span></div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: 13 }}>
              No submissions with status &ldquo;{filter === 'All' ? 'All' : STATUS_LABELS[filter]}&rdquo;
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', paddingBottom: 48 }}>
          Showing {filtered.length} of {submissions.length} submissions
        </div>
      </div>
    </div>
  );
}
