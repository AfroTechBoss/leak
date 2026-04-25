import Nav from '@/components/Nav';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />

      {/* Hero */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '130px 24px 80px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -55%)',
          width: 600, height: 400,
          background: 'radial-gradient(ellipse, oklch(0.78 0.14 68 / 0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="h-1" style={{
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
          letterSpacing: '0.22em', color: 'var(--accent)', marginBottom: 44,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{
            display: 'inline-block', width: 7, height: 7,
            background: 'var(--accent)', borderRadius: '50%', flexShrink: 0,
            animation: 'beaconPulse 2.2s ease-in-out infinite',
          }} />
          Secure · Anonymous · End-to-End Encrypted
        </div>

        <div className="h-2" style={{ marginBottom: 28 }}>
          <h1 style={{
            fontFamily: 'var(--mono)', fontSize: 'clamp(80px, 15vw, 148px)',
            fontWeight: 500, letterSpacing: '0.2em', color: 'var(--text)', lineHeight: 1,
            margin: 0,
            textShadow: '0 0 120px oklch(0.78 0.14 68 / 0.18)',
          }}>LEAK</h1>
        </div>

        <div className="h-5" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 150 }}>
          <Link href="/submit" className="btn-primary" style={{ padding: '16px 44px', fontSize: 15 }}>
            Submit Evidence
          </Link>
          <Link href="/status" className="btn-ghost" style={{ padding: '15px 30px', fontSize: 15 }}>
            Check Case Status
          </Link>
        </div>
      </div>

      {/* Trust bar */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[
          { label: 'Zero Accounts', desc: 'No email, phone, or identity required' },
          { label: 'No IP Logging',  desc: 'Your network location is never stored' },
          { label: 'E2E Encrypted',  desc: 'Operators cannot read submission content' },
        ].map((item, i) => (
          <div key={i} style={{ padding: '30px 36px', borderRight: i < 2 ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 7 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ padding: '80px 32px', maxWidth: 1040, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 48 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-dim)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>How it works</div>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {[
            { n: '01', title: 'Submit evidence',        body: 'Upload files, describe what you witnessed, and select your state. No account or identity required at any step.' },
            { n: '02', title: 'Receive your Case Code', body: 'One unique code is generated. It is your only identifier. Save it securely — it cannot be recovered if lost.' },
            { n: '03', title: 'Follow up securely',     body: 'Return with your code to read messages from the assigned journalist and provide further evidence if requested.' },
          ].map((step, i) => (
            <div key={step.n} style={{
              background: 'var(--bg-card)', padding: '36px 32px',
              borderTop: `2px solid ${i === 0 ? 'var(--accent)' : 'transparent'}`,
              borderLeft: '1px solid var(--border)',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 20, letterSpacing: '0.12em' }}>{step.n} / 03</div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 12, letterSpacing: '-0.01em' }}>{step.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.85 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border)' }}>
        {[
          { value: '2,400+', label: 'Submissions received' },
          { value: '38',     label: 'Published investigations' },
          { value: '4',      label: 'Partner newsrooms' },
          { value: '0',      label: 'Source identities exposed' },
        ].map((stat, i) => (
          <div key={i} style={{ padding: '32px 28px', borderRight: i < 3 ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 500, color: i === 3 ? 'var(--green)' : 'var(--text)', marginBottom: 6 }}>{stat.value}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Partners */}
      <div style={{ padding: '40px 32px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 24 }}>
          Submissions routed to verified journalists at
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 52, flexWrap: 'wrap' }}>
          {['Premium Times', 'TheCable', 'Peoples Gazette', 'HumAngle'].map(p => (
            <div key={p} style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-dim)', fontWeight: 500, letterSpacing: '0.04em' }}>{p}</div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '28px 32px 34px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 18,
        flexWrap: 'wrap',
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
          Copyright (2026) LEAK
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="https://twitter.com/leakplatform"
            target="_blank"
            rel="noreferrer"
            style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.08em' }}
          >
            Twitter
          </a>
          <Link href="/privacy" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            Privacy
          </Link>
          <Link href="/about" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            About
          </Link>
          <a href="mailto:contact@leak.ng" style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            contact@leak.ng
          </a>
        </div>
      </footer>
    </div>
  );
}
