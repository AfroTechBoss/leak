import nodemailer from 'nodemailer';

const FROM    = process.env.EMAIL_FROM    ?? 'LEAK <noreply@leak.ng>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendInviteEmail({
  to,
  name,
  newsroom,
  token,
}: {
  to: string;
  name: string;
  newsroom: string;
  token: string;
}) {
  const link = `${APP_URL}/journalist/invite/${token}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You've been invited to LEAK</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #07080a;
      font-family: 'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      padding: 40px 16px 60px;
    }
    .wrapper { max-width: 560px; margin: 0 auto; }

    /* — Top wordmark — */
    .wordmark {
      font-family: 'DM Mono', 'Courier New', 'Lucida Console', monospace;
      font-size: 15px;
      font-weight: 500;
      letter-spacing: 0.22em;
      color: #6b7585;
      margin-bottom: 28px;
      display: block;
    }

    /* — Card — */
    .card {
      background: #0e0f11;
      border: 1px solid rgba(255,255,255,0.07);
      border-top: 2px solid #c8924a;
      padding: 40px 40px 36px;
    }

    /* — Inside card header — */
    .card-logo {
      font-family: 'DM Mono', 'Courier New', 'Lucida Console', monospace;
      font-size: 22px;
      font-weight: 500;
      letter-spacing: 0.2em;
      color: #dde1e8;
      margin-bottom: 28px;
      display: block;
    }
    .eyebrow {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.22em;
      color: #c8924a;
      text-transform: uppercase;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .eyebrow-dot {
      display: inline-block;
      width: 6px; height: 6px;
      background: #c8924a;
      border-radius: 50%;
    }
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: #dde1e8;
      letter-spacing: -0.02em;
      line-height: 1.3;
      margin-bottom: 20px;
    }

    /* — Info card — */
    .info-card {
      background: #111316;
      border: 1px solid rgba(255,255,255,0.07);
      padding: 16px 20px;
      margin: 24px 0;
      display: table;
      width: 100%;
    }
    .info-row { display: table-row; }
    .info-label {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 10px;
      letter-spacing: 0.12em;
      color: #6b7585;
      text-transform: uppercase;
      padding: 6px 20px 6px 0;
      display: table-cell;
      white-space: nowrap;
    }
    .info-value {
      font-size: 13px;
      font-weight: 500;
      color: #dde1e8;
      padding: 6px 0;
      display: table-cell;
    }

    /* — Body text — */
    .body-text {
      font-size: 14px;
      color: #6b7585;
      line-height: 1.85;
      margin-bottom: 14px;
    }
    .body-text strong { color: #dde1e8; font-weight: 500; }

    /* — CTA button — */
    .btn-wrap { margin: 28px 0 20px; }
    .btn {
      display: inline-block;
      background: #c8924a;
      color: #07080a !important;
      font-family: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.02em;
      padding: 14px 36px;
      text-decoration: none;
    }

    /* — Link fallback — */
    .link-box {
      background: #111316;
      border: 1px solid rgba(255,255,255,0.07);
      padding: 12px 16px;
      margin-top: 16px;
    }
    .link-label {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 10px;
      letter-spacing: 0.1em;
      color: #6b7585;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .link-url {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 11px;
      color: #c8924a;
      word-break: break-all;
      line-height: 1.6;
    }

    /* — Divider — */
    .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 28px 0; }

    /* — Warning — */
    .warning {
      font-size: 12px;
      color: #2e333c;
      line-height: 1.75;
    }

    /* — Footer — */
    .footer {
      margin-top: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .footer-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
    .footer-text {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 10px;
      letter-spacing: 0.1em;
      color: #2e333c;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <span class="wordmark">LEAK</span>

    <div class="card">

      <div class="eyebrow">
        <span class="eyebrow-dot"></span>
        Journalist Invite
      </div>

      <div class="greeting">Welcome, ${name}.</div>

      <p class="body-text">
        You have been invited to join the <strong>LEAK</strong> platform as a
        verified journalist for <strong>${newsroom}</strong>.
      </p>
      <p class="body-text">
        LEAK is a secure whistleblowing pipeline that routes anonymous tips to
        investigative journalists. You will receive submissions, communicate with
        sources, and manage case investigations — all through an end-to-end
        encrypted interface.
      </p>
      <p class="body-text">
        Click below to set your password and activate your account.
        This link expires in <strong>48 hours</strong>.
      </p>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">${to}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Newsroom</span>
          <span class="info-value">${newsroom}</span>
        </div>
      </div>

      <div class="btn-wrap">
        <a href="${link}" class="btn">Activate my account →</a>
      </div>

      <div class="link-box">
        <div class="link-label">Or copy this link into your browser</div>
        <div class="link-url">${link}</div>
      </div>

      <div class="divider"></div>

      <p class="warning">
        If you did not expect this invitation or do not recognise this platform,
        you can safely ignore this email. No account will be created unless
        you click the link above.
      </p>
    </div>

    <div class="footer">
      <div class="footer-line"></div>
      <div class="footer-text">SECURE · ANONYMOUS · E2E ENCRYPTED</div>
      <div class="footer-line"></div>
    </div>

  </div>
</body>
</html>
`.trim();

  const text = `
Welcome to LEAK, ${name}.

You have been invited to join the LEAK platform as a verified journalist for ${newsroom}.

Activate your account here:
${link}

This link expires in 48 hours.

If you did not expect this invitation, ignore this email.
`.trim();

  const transport = createTransport();
  await transport.sendMail({
    from:    FROM,
    to,
    subject: `You've been invited to LEAK — set your password`,
    html,
    text,
  });
}
