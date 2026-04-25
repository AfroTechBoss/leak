import Nav from '@/components/Nav';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — LEAK',
  description: 'LEAK Privacy Policy — how we handle your data and protect your anonymity.',
};

const LAST_UPDATED = 'April 2026';

export default function PrivacyPage() {
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
          letterSpacing: '0.22em', color: 'var(--accent)', marginBottom: 20,
        }}>
          Privacy Policy
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600,
          letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 16,
        }}>
          How we protect your anonymity
        </h1>
        <p style={{
          fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-muted)',
          letterSpacing: '0.06em',
        }}>
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '64px 32px', width: '100%' }}>

        <Section n="1" title="Overview">
          <P>
            LEAK ("the Platform", "we", "us") is a whistleblowing service designed to allow individuals to
            submit sensitive information to investigative journalists without revealing their identity. This
            Privacy Policy explains what data we collect, how we use it, and the technical measures we take
            to protect you.
          </P>
          <P>
            This platform is operated in the public interest. We collect the minimum possible data required
            to route your submission to a journalist and allow secure follow-up communication. We do not
            monetise your data, share it with advertisers, or retain it beyond what is necessary.
          </P>
        </Section>

        <Section n="2" title="What we do not collect">
          <P>The following information is <strong>never collected or stored</strong> by LEAK:</P>
          <List items={[
            'Your name, email address, phone number, or any other personal identifier',
            'Your IP address — we do not log IP addresses at any point during submission or case lookup',
            'Your device fingerprint, browser type, or operating system details for tracking purposes',
            'Cookies or tracking pixels linked to your identity',
            'Your Case Code in plaintext — only a one-way cryptographic hash is stored',
          ]} />
        </Section>

        <Section n="3" title="What we do collect">
          <P>When you submit a case, the following data is stored:</P>
          <List items={[
            'The content of your submission — encrypted using end-to-end encryption before storage (see Section 5)',
            'The category and Nigerian state you selected',
            'Any files you attached, after metadata stripping (see Section 6)',
            'A bcrypt hash of your Case Code — a one-way fingerprint used to verify you later',
            'The date and time the submission was created',
            'A newsroom assignment (which partner organisation received your submission)',
          ]} />
          <P>
            When you send or receive messages via the platform, those messages are also stored encrypted
            and are only decryptable by the assigned journalist and, where applicable, you via your Case Code.
          </P>
        </Section>

        <Section n="4" title="Your Case Code">
          <P>
            When you submit, LEAK generates a unique four-word Case Code (e.g. <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontSize: 13 }}>bridge-farm-cold-night</span>).
            This code is your only identifier. It works like a password — it lets you return to check your
            submission status and communicate with your journalist.
          </P>
          <P>
            <strong>The raw Case Code is never stored.</strong> The moment it is generated, only a
            bcrypt hash (a one-way transformation) is written to the database. Even if our database
            were fully compromised, no one could reverse the hash to recover your code or link it
            back to you.
          </P>
          <P>
            If you lose your Case Code, we cannot recover it for you. There is no account recovery
            mechanism by design.
          </P>
        </Section>

        <Section n="5" title="Encryption">
          <P>
            All submission content (your description, and all messages in the conversation thread)
            is encrypted using <strong>NaCl box encryption</strong> (TweetNaCl, XSalsa20-Poly1305)
            before being written to our database. Encryption uses the server's public key together
            with an ephemeral keypair generated fresh for each message.
          </P>
          <P>
            This means:
          </P>
          <List items={[
            'The content stored in the database is ciphertext — unreadable without the private key',
            'Platform operators and database administrators cannot read your submission',
            'Only the journalist assigned to your case can decrypt and read the content',
            'The nonce (random value used in encryption) is stored alongside the ciphertext but is useless without the private key',
          ]} />
          <P>
            The server's keypair is generated once at setup and stored only in the server environment.
            It is never committed to version control or exposed publicly.
          </P>
        </Section>

        <Section n="6" title="File metadata stripping">
          <P>
            Files you upload (images, PDFs, documents) can contain hidden metadata that may identify
            you — for example, the GPS coordinates of where a photo was taken, the author field of a
            Word document, or the device serial number embedded in an image.
          </P>
          <P>
            LEAK automatically strips this metadata before storing any file:
          </P>
          <List items={[
            'Images (JPEG, PNG, TIFF, WebP): EXIF data, GPS tags, and device metadata are removed using the Sharp image processing library',
            'PDF files: Document properties including author, creator, subject, and modification history are cleared',
            'All other file types are stored as uploaded — we recommend removing metadata manually before uploading',
          ]} />
          <P>
            Files are stored in a private, access-controlled bucket. They are not publicly accessible.
            Only authenticated journalists at the assigned newsroom can download them.
          </P>
        </Section>

        <Section n="7" title="Audit logs">
          <P>
            LEAK maintains an internal audit trail of significant events on each submission — for example,
            when it was received, when it was assigned, and when a journalist downloaded a file.
            This log is used to ensure accountability among journalists using the platform.
          </P>
          <P>
            Audit log entries may include a hashed (not raw) version of the journalist's IP address
            for internal security purposes. Audit logs are never exposed to whistleblowers or the public.
          </P>
        </Section>

        <Section n="8" title="Data retention">
          <P>
            We retain submission data for as long as the case is active and for a reasonable period
            thereafter to allow published investigations to be supported with source records if challenged.
          </P>
          <P>
            Submissions marked as <strong>Archived</strong> or <strong>Rejected</strong> by a journalist
            are eligible for deletion after 12 months. You may request early deletion of your submission
            by contacting a partner newsroom directly with your Case Code as proof of ownership.
          </P>
        </Section>

        <Section n="9" title="Third-party services">
          <P>LEAK relies on the following third-party infrastructure:</P>
          <List items={[
            'Supabase (PostgreSQL database and file storage) — hosted on AWS EU West (Ireland). Supabase does not have access to encrypted content.',
            'Vercel or equivalent Next.js hosting provider — processes HTTP requests. Server logs are governed by the hosting provider\'s own privacy policy.',
          ]} />
          <P>
            We do not use any analytics services, advertising networks, or social media tracking pixels.
          </P>
        </Section>

        <Section n="10" title="Your rights">
          <P>
            Because LEAK does not link your submission to an identity, we cannot respond to data
            subject access requests in the traditional sense — we have no way to verify who you are.
            If you need to exercise rights over your submission specifically, your Case Code serves
            as proof of ownership.
          </P>
          <P>
            If you believe your submission should be deleted or corrected, contact the assigned
            newsroom. Journalists at partner newsrooms are subject to their own editorial privacy
            standards.
          </P>
        </Section>

        <Section n="11" title="Changes to this policy">
          <P>
            We may update this Privacy Policy from time to time. The "Last updated" date at the top
            of this page will reflect any changes. Continued use of the platform after an update
            constitutes acceptance of the revised policy.
          </P>
        </Section>

        <Section n="12" title="Contact">
          <P>
            LEAK is operated in partnership with its four partner newsrooms. If you have questions
            about this Privacy Policy or how your data is handled, you may reach out through any
            of the partner newsroom's editorial contact channels.
          </P>
        </Section>

        {/* Footer nav */}
        <div style={{
          marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--border)',
          display: 'flex', gap: 12, flexWrap: 'wrap',
        }}>
          <Link href="/about" className="btn-ghost" style={{ padding: '10px 20px', fontSize: 13 }}>About LEAK</Link>
          <Link href="/submit" className="btn-primary" style={{ padding: '10px 24px', fontSize: 13 }}>Submit Evidence</Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16, marginTop: 'auto',
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
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 56 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', letterSpacing: '0.2em', minWidth: 20 }}>{n}</div>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 16, color: 'var(--text)' }}>
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.9, marginBottom: 14 }}>
      {children}
    </p>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: '0 0 14px', paddingLeft: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          padding: '8px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: 10, paddingTop: 4, flexShrink: 0 }}>→</span>
          <span style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.75 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
