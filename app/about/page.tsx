import Nav from '@/components/Nav';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — LEAK',
  description: 'Learn about LEAK, the secure anonymous whistleblowing platform connecting sources with investigative journalists in Nigeria.',
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav />

      {/* Header */}
      <div style={{
        borderBottom: '1px solid var(--border)',
        padding: '120px 32px 60px',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
          letterSpacing: '0.22em', color: 'var(--accent)', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <span style={{
            display: 'inline-block', width: 7, height: 7,
            background: 'var(--accent)', borderRadius: '50%',
            animation: 'beaconPulse 2.2s ease-in-out infinite',
          }} />
          About the Platform
        </div>
        <h1 style={{
          fontFamily: 'var(--mono)', fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 500, letterSpacing: '0.15em', color: 'var(--text)', marginBottom: 20,
        }}>LEAK</h1>
        <p style={{
          fontSize: 15, color: 'var(--text-dim)', lineHeight: 1.85,
          maxWidth: 520, margin: '0 auto',
        }}>
          A secure, anonymous submission pipeline connecting whistleblowers with
          verified investigative journalists across Nigeria.
        </p>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '64px 32px', width: '100%' }}>

        {/* What is LEAK */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.2em' }}>01</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 16 }}>What is LEAK?</h2>
          <p style={{ fontSize: 15, color: 'var(--text-dim)', lineHeight: 1.9, marginBottom: 16 }}>
            LEAK is a digital whistleblowing platform built specifically for Nigeria. It gives ordinary citizens —
            civil servants, contractors, community members, eyewitnesses — a safe and anonymous channel to share
            evidence of wrongdoing with professional journalists who can investigate and publish it.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-dim)', lineHeight: 1.9 }}>
            The platform was built around a single principle: <span style={{ color: 'var(--text)', fontWeight: 500 }}>a source should never have to trust
            the platform with their identity.</span> LEAK is designed so that even if our servers were seized tomorrow,
            no source could be identified from the data we hold.
          </p>
        </section>

        {/* Why it exists */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.2em' }}>02</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 16 }}>Why it exists</h2>
          <p style={{ fontSize: 15, color: 'var(--text-dim)', lineHeight: 1.9, marginBottom: 16 }}>
            Investigative journalism in Nigeria depends on sources — people willing to speak up about corruption,
            abuse, and injustice. But those sources face real risks: professional retaliation, legal harassment,
            and in serious cases, physical danger.
          </p>
          <p style={{ fontSize: 15, color: 'var(--text-dim)', lineHeight: 1.9 }}>
            Most people who witness wrongdoing never come forward because they do not know how to reach a journalist safely,
            or they fear that any contact — even a single email — could expose them. LEAK removes that barrier.
            You do not create an account. You do not provide your name or contact details.
            You submit, receive a case code, and that is the only thread between you and your submission.
          </p>
        </section>

        {/* How it works */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.2em' }}>03</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 24 }}>How it works</h2>

          <div style={{ display: 'grid', gap: 2 }}>
            {[
              {
                step: '01',
                title: 'You submit evidence',
                body: 'Fill in a short form describing what you witnessed, select your state and category, and attach any supporting files. No login. No email. No name.',
              },
              {
                step: '02',
                title: 'Your submission is encrypted',
                body: 'The moment you submit, your description is encrypted on our server using end-to-end encryption. Even LEAK operators cannot read the content — only the assigned journalist can decrypt it.',
              },
              {
                step: '03',
                title: 'You receive a Case Code',
                body: 'A unique four-word code is generated for your submission. This is your only identifier — a cryptographic token. The raw code is never stored on our servers. Save it securely.',
              },
              {
                step: '04',
                title: 'A journalist investigates',
                body: 'Your submission is routed to a verified journalist at one of our partner newsrooms based on the category and region of the case. They review the evidence and may send follow-up questions.',
              },
              {
                step: '05',
                title: 'You follow up anonymously',
                body: 'Return to the platform at any time, enter your Case Code, and read messages from the journalist. You can reply, provide more evidence, or simply track the progress of your case.',
              },
            ].map((item, i, arr) => (
              <div key={item.step} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderTop: i === 0 ? '2px solid var(--accent)' : '1px solid var(--border)',
                padding: '28px 32px',
                display: 'grid',
                gridTemplateColumns: '48px 1fr',
                gap: 20,
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.12em', paddingTop: 3 }}>{item.step}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, letterSpacing: '-0.01em' }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.85 }}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Partner newsrooms */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.2em' }}>04</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 16 }}>Our partner newsrooms</h2>
          <p style={{ fontSize: 15, color: 'var(--text-dim)', lineHeight: 1.9, marginBottom: 32 }}>
            Submissions are routed exclusively to journalists at verified partner newsrooms. These are established,
            independent media organisations with demonstrated track records in investigative reporting in Nigeria.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            {[
              { name: 'Premium Times', desc: 'Nigeria\'s leading digital investigative newspaper, known for breaking major corruption stories.' },
              { name: 'TheCable',      desc: 'Independent online newspaper covering politics, business, and accountability reporting.' },
              { name: 'Peoples Gazette', desc: 'Award-winning newspaper focused on fact-based, independent journalism in the public interest.' },
              { name: 'HumAngle',     desc: 'Specialised reporting on conflict, security, and humanitarian issues across the Sahel and Nigeria.' },
            ].map((room) => (
              <div key={room.name} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                padding: '24px 28px',
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8, letterSpacing: '0.04em' }}>{room.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.75 }}>{room.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Security guarantees */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.2em' }}>05</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 24 }}>What we guarantee</h2>
          <div style={{ display: 'grid', gap: 2 }}>
            {[
              { label: 'No accounts',        body: 'You never create a username, provide an email address, or link any identity to your submission.' },
              { label: 'No IP logging',       body: 'We do not store or log your IP address at any point during submission or case lookup.' },
              { label: 'End-to-end encryption', body: 'Submission content is encrypted before it is written to our database. Operators cannot read it.' },
              { label: 'Metadata stripping',  body: 'All uploaded files are processed to remove embedded metadata (EXIF, GPS coordinates, document authorship) before storage.' },
              { label: 'No raw case codes',   body: 'Your Case Code is never stored. Only a one-way cryptographic hash exists in our database — it cannot be reversed to recover your code.' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', gap: 20, padding: '20px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', fontWeight: 500, minWidth: 180, paddingTop: 1 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.8 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderTop: '2px solid var(--accent)',
          padding: '40px 36px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-dim)', marginBottom: 16 }}>
            Ready to speak up?
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, letterSpacing: '-0.01em' }}>Your evidence matters.</h3>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
            If you have witnessed corruption, abuse, or injustice and want it investigated — LEAK is built for you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/submit" className="btn-primary" style={{ padding: '14px 36px' }}>Submit Evidence</Link>
            <Link href="/privacy" className="btn-ghost" style={{ padding: '13px 24px' }}>Read Privacy Policy</Link>
          </div>
        </div>

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16,
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>LEAK</div>
      <div style={{ display: 'flex', gap: 24 }}>
        <Link href="/about" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.08em' }}>About</Link>
        <Link href="/privacy" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.08em' }}>Privacy Policy</Link>
        <Link href="/submit" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.08em' }}>Submit</Link>
        <Link href="/status" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.08em' }}>Check Status</Link>
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} LEAK Platform
      </div>
    </footer>
  );
}
