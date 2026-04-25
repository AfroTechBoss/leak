import nodemailer from 'nodemailer';

const FROM    = process.env.EMAIL_FROM    ?? 'LEAK <noreply@leak.ng>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',   // true = port 465 TLS, false = STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,  // allow self-signed certs (common on shared hosting)
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
  <style>
    body { margin: 0; padding: 0; background: #07080a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; padding: 0 24px; }
    .card { background: #0e0f11; border: 1px solid #1e1f22; border-top: 2px solid #c8924a; padding: 40px 40px 36px; }
    .logo { font-family: 'Courier New', monospace; font-size: 20px; font-weight: 500; letter-spacing: 0.2em; color: #f0ebe0; margin-bottom: 32px; }
    .greeting { font-size: 22px; font-weight: 600; color: #f0ebe0; letter-spacing: -0.01em; margin-bottom: 16px; }
    .body { font-size: 15px; color: #8a8070; line-height: 1.8; margin-bottom: 16px; }
    .btn { display: inline-block; background: #c8924a; color: #07080a; font-weight: 600; font-size: 15px; padding: 14px 32px; text-decoration: none; letter-spacing: 0.02em; margin: 24px 0; }
    .link-fallback { font-family: 'Courier New', monospace; font-size: 12px; color: #5a5040; word-break: break-all; margin-top: 8px; }
    .divider { height: 1px; background: #1e1f22; margin: 28px 0; }
    .footer { font-family: 'Courier New', monospace; font-size: 11px; color: #3a3530; letter-spacing: 0.08em; text-align: center; margin-top: 24px; }
    .warning { font-size: 13px; color: #5a5040; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">LEAK</div>
      <div class="greeting">Welcome, ${name}.</div>
      <p class="body">
        You have been invited to join the LEAK platform as a verified journalist for
        <strong style="color: #f0ebe0;">${newsroom}</strong>.
      </p>
      <p class="body">
        LEAK is a secure whistleblowing platform that routes anonymous tips from sources
        to investigative journalists. You will receive submissions, communicate with
        sources, and manage case investigations — all through an encrypted interface.
      </p>
      <p class="body">
        Click the button below to set your password and activate your account.
        This link expires in <strong style="color: #f0ebe0;">48 hours</strong>.
      </p>

      <a href="${link}" class="btn">Set my password →</a>

      <p class="link-fallback">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        ${link}
      </p>

      <div class="divider"></div>

      <p class="warning">
        If you did not expect this invitation or do not recognise this platform,
        you can safely ignore this email. No account will be created unless you
        click the link above.
      </p>
    </div>
    <div class="footer">LEAK PLATFORM &nbsp;·&nbsp; SECURE &nbsp;·&nbsp; ANONYMOUS &nbsp;·&nbsp; END-TO-END ENCRYPTED</div>
  </div>
</body>
</html>
`.trim();

  const text = `
Welcome to LEAK, ${name}.

You have been invited to join the LEAK platform as a verified journalist for ${newsroom}.

Set your password and activate your account here:
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
