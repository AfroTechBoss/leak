'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import ProgressBar from '@/components/ProgressBar';
import { CATEGORIES, STATES } from '@/lib/constants';

type SubmitData = {
  category: string;
  state: string;
  description: string;
  files: Array<{ name: string; size: number; file: File }>;
};

export default function SubmitPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<SubmitData>({ category: '', state: '', description: '', files: [] });
  const [submitting, setSubmitting] = useState(false);
  const [caseCode, setCaseCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('category', data.category);
      formData.append('state', data.state);
      formData.append('description', data.description);
      data.files.forEach(f => formData.append('files', f.file));

      const res = await fetch('/api/submit', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Submission failed');
      const json = await res.json();
      setCaseCode(json.caseCode);
      setStep(5);
    } catch {
      setSubmitting(false);
      alert('Submission failed. Please try again.');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(caseCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles).slice(0, 5 - data.files.length);
    setData(d => ({
      ...d,
      files: [...d.files, ...arr.map(f => ({ name: f.name, size: f.size, file: f }))].slice(0, 5),
    }));
  };

  const fmtSize = (b: number) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1e3).toFixed(0)} KB`;

  const cat = CATEGORIES.find(c => c.id === data.category);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Nav />
      <div style={{ maxWidth: 620, margin: '0 auto', padding: '96px 24px 80px' }}>

        {/* ── Step 1: Category + State ── */}
        {step === 1 && (
          <div className="fade-in">
            <ProgressBar step={1} total={4} />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 10 }}>Step 1 of 4</div>
            <h2 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>What are you reporting?</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 36 }}>Select the category that best describes your evidence.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 32 }}>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setData(d => ({ ...d, category: c.id }))} style={{
                  background: data.category === c.id ? 'var(--accent-dim)' : 'var(--bg-card)',
                  border: `1px solid ${data.category === c.id ? 'var(--accent-border)' : 'var(--border)'}`,
                  color: data.category === c.id ? 'var(--accent)' : 'var(--text)',
                  padding: '18px 20px', textAlign: 'left', cursor: 'pointer',
                  fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
                }}>{c.label}</button>
              ))}
            </div>
            <div style={{ marginBottom: 32 }}>
              <label className="field-label">State / Territory</label>
              <select className="field-input" value={data.state} onChange={e => setData(d => ({ ...d, state: e.target.value }))}>
                <option value="">Select a state…</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button className="btn-primary" style={{ width: '100%' }}
              disabled={!data.category || !data.state}
              onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Description ── */}
        {step === 2 && (
          <div className="fade-in">
            <ProgressBar step={2} total={4} />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 10 }}>Step 2 of 4</div>
            <h2 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>Describe what you witnessed</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 36 }}>
              Who was involved, what happened, when, and where. Do not include your own name or identifying details.
            </p>
            <div style={{ marginBottom: 24 }}>
              <label className="field-label">Your account — <span style={{ fontWeight: 400 }}>minimum 100 characters</span></label>
              <textarea className="field-input" style={{ minHeight: 200 }}
                placeholder="Describe the misconduct in as much detail as you can — dates, amounts, names of officials, locations, and any corroborating context…"
                value={data.description}
                onChange={e => setData(d => ({ ...d, description: e.target.value }))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--mono)', fontSize: 12 }}>
                <span style={{ color: data.description.trim().length >= 100 ? 'var(--green)' : 'var(--text-dim)' }}>
                  {data.description.trim().length >= 100 ? '✓ Minimum length met' : `${100 - data.description.trim().length} more characters needed`}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{data.description.length}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" style={{ flex: 1 }}
                disabled={data.description.trim().length < 100}
                onClick={() => setStep(3)}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Files ── */}
        {step === 3 && (
          <div className="fade-in">
            <ProgressBar step={3} total={4} />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 10 }}>Step 3 of 4</div>
            <h2 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>Attach evidence</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 28 }}>PDF, DOCX, JPG, PNG, MP3, MP4 · Max 50 MB per file · Up to 5 files</p>
            <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--accent)', flexShrink: 0, marginTop: 1 }}>AUTO-STRIP</span>
              <span style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>All metadata is stripped before storage — EXIF from images, document properties from Office and PDF files.</span>
            </div>
            {data.files.length < 5 && (
              <div onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                style={{
                  border: '1px dashed var(--border-strong)', padding: '40px 24px',
                  textAlign: 'center', cursor: 'pointer', marginBottom: 12, transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
              >
                <input ref={fileInputRef} type="file" multiple style={{ display: 'none' }}
                  onChange={e => addFiles(e.target.files)} />
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-dim)' }}>Drop files here or click to browse</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{5 - data.files.length} slot{5 - data.files.length !== 1 ? 's' : ''} remaining</div>
              </div>
            )}
            {data.files.map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '12px 16px', marginBottom: 6,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{fmtSize(f.size)} · metadata will be stripped</div>
                </div>
                <button onClick={() => setData(d => ({ ...d, files: d.files.filter((_, j) => j !== i) }))}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setStep(4)}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── Step 4: Review ── */}
        {step === 4 && (
          <div className="fade-in">
            <ProgressBar step={4} total={4} />
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 10 }}>Step 4 of 4</div>
            <h2 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8 }}>Review and submit</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 36 }}>Confirm the details below. Submissions cannot be edited after receipt.</p>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: 20 }}>
              {[
                { label: 'Category',       value: cat?.label || data.category },
                { label: 'State',          value: data.state },
                { label: 'Files attached', value: data.files.length ? `${data.files.length} file${data.files.length !== 1 ? 's' : ''}` : 'None attached' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
            </div>
            {data.description && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '18px 20px', marginBottom: 28 }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em', marginBottom: 10 }}>DESCRIPTION PREVIEW</div>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.8 }}>
                  {data.description.length > 320 ? data.description.slice(0, 320) + '…' : data.description}
                </p>
              </div>
            )}
            <label style={{ display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 32 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                style={{ marginTop: 3, accentColor: 'var(--accent)', width: 16, height: 16, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7 }}>
                I confirm the information submitted is accurate to the best of my knowledge. I understand that fabricated submissions undermine legitimate accountability efforts.
              </span>
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-ghost" onClick={() => setStep(3)}>← Back</button>
              <button className="btn-primary" style={{ flex: 1 }}
                disabled={!agreed || submitting}
                onClick={handleSubmit}>
                {submitting ? 'Encrypting and submitting…' : 'Submit Evidence →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: Receipt ── */}
        {step === 5 && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--green-dim)', border: '1px solid oklch(0.72 0.15 145 / 0.25)', padding: '8px 18px', marginBottom: 44 }}>
              <span style={{ width: 7, height: 7, background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--green)', letterSpacing: '0.12em' }}>SUBMISSION RECEIVED</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Your Case Code</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.8, maxWidth: 440, margin: '0 auto 40px' }}>
              This is the only identifier for your submission. Save it somewhere safe. It cannot be recovered if lost.
            </p>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-strong)', padding: '40px 24px', marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 18 }}>CASE CODE</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(22px, 5vw, 34px)', fontWeight: 500, letterSpacing: '0.12em', color: 'var(--accent)' }}>{caseCode}</div>
            </div>
            <button onClick={copy} className="btn-ghost" style={{ width: '100%', marginBottom: 44 }}>
              {copied ? '✓ Copied to clipboard' : 'Copy to clipboard'}
            </button>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px', textAlign: 'left', marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 18 }}>WHAT HAPPENS NEXT</div>
              {[
                'A verified journalist at a partner organisation will review your submission within 72 hours.',
                'They may send follow-up questions via this platform. Return here with your Case Code to check.',
                'If your submission leads to an investigation, you may be cited as "Source submitted via Leak".',
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < 2 ? 14 : 0 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }}>0{i + 1}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.75 }}>{s}</span>
                </div>
              ))}
            </div>
            <button className="btn-ghost" style={{ width: '100%' }} onClick={() => router.push('/')}>Return to homepage</button>
          </div>
        )}

      </div>
    </div>
  );
}
