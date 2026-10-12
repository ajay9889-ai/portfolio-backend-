/**
 * mailer.ts
 * Thin wrapper around Nodemailer that adds:
 *   - Retry once on SMTP failure
 *   - Failed-send store (so no message is ever lost)
 *   - Optional auto-reply to visitor (gated by AUTO_REPLY_ENABLED=true env)
 *   - Styled HTML email matching the existing portfolio brand
 *
 * Credentials read only from env — never passed in from client.
 */

import nodemailer from 'nodemailer';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ContactPayload {
  id: string;
  name: string;
  email: string;
  message: string;
  company?: string;
  purpose?: string;
  sessionId?: string;
  pageUrl?: string;
  ip?: string;
  createdAt: string;
}

export interface SendResult {
  ok: boolean;
  error?: string;
}

// ── Failed-send store (survives a single process lifecycle — enough for retry) ─

interface FailedEntry {
  payload: ContactPayload;
  failedAt: string;
  attempts: number;
  error: string;
}

const failedStore: FailedEntry[] = [];

export function getFailedMessages(): FailedEntry[] {
  return [...failedStore];
}

// ── Transport factory ─────────────────────────────────────────────────────────

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    tls: { rejectUnauthorized: false },
  });
}

// ── HTML email template (portfolio brand: dark bg, orange accent) ─────────────

function buildOwnerEmail(msg: ContactPayload): string {
  const purposeLabel = msg.purpose ? msg.purpose.charAt(0).toUpperCase() + msg.purpose.slice(1) : 'General';
  const receivedAt = new Date(msg.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0E0E12;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:560px;margin:32px auto;background:#121218;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#FF5500,#FF7A00);padding:24px 28px;">
    <h2 style="margin:0;color:#fff;font-size:18px;font-weight:700;">📬 New Portfolio Message</h2>
    <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">via AI Assistant — ${purposeLabel}</p>
  </div>
  <div style="padding:28px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#8B8B95;font-size:13px;width:90px;vertical-align:top;">From</td>
          <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">${msg.name}</td></tr>
      <tr><td style="padding:8px 0;color:#8B8B95;font-size:13px;vertical-align:top;">Email</td>
          <td style="padding:8px 0;"><a href="mailto:${msg.email}" style="color:#FF7A00;text-decoration:none;font-size:14px;">${msg.email}</a></td></tr>
      ${msg.company ? `<tr><td style="padding:8px 0;color:#8B8B95;font-size:13px;vertical-align:top;">Company</td>
          <td style="padding:8px 0;color:#E0E0E8;font-size:14px;">${msg.company}</td></tr>` : ''}
      <tr><td style="padding:8px 0;color:#8B8B95;font-size:13px;vertical-align:top;">Purpose</td>
          <td style="padding:8px 0;color:#E0E0E8;font-size:14px;">${purposeLabel}</td></tr>
    </table>
    <div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;">
      <p style="margin:0;color:#E0E0E8;font-size:14px;line-height:1.6;white-space:pre-wrap;">${msg.message}</p>
    </div>
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
      <p style="margin:0;color:#555;font-size:11px;font-family:monospace;">
        Received at ${receivedAt} IST &nbsp;·&nbsp; ID: ${msg.id}
        ${msg.pageUrl ? `&nbsp;·&nbsp; Page: ${msg.pageUrl}` : ''}
      </p>
    </div>
  </div>
</div>
</body>
</html>`.trim();
}

function buildAutoReply(name: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0E0E12;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:520px;margin:32px auto;background:#121218;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#FF5500,#FF7A00);padding:24px 28px;">
    <h2 style="margin:0;color:#fff;font-size:18px;font-weight:700;">Message Received! 🎉</h2>
  </div>
  <div style="padding:28px;color:#E0E0E8;">
    <p style="font-size:15px;line-height:1.7;">Hi ${name},</p>
    <p style="font-size:14px;line-height:1.7;color:#ABABBC;">
      Ajay received your message and will get back to you as soon as possible — usually within 24 hours.
    </p>
    <p style="font-size:14px;line-height:1.7;color:#ABABBC;">
      In the meantime, feel free to explore his portfolio or connect on
      <a href="https://linkedin.com/in/ajay-a" style="color:#FF7A00;text-decoration:none;">LinkedIn</a> or
      <a href="https://github.com/ajay9889-ai" style="color:#FF7A00;text-decoration:none;">GitHub</a>.
    </p>
    <p style="font-size:13px;color:#555;margin-top:24px;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">
      This is an automated confirmation. Please do not reply to this email.
    </p>
  </div>
</div>
</body>
</html>`.trim();
}

// ── Core send (with single retry) ────────────────────────────────────────────

async function trySend(payload: ContactPayload): Promise<void> {
  const transporter = createTransport();
  const ownerEmail = process.env.OWNER_NOTIFY_EMAIL || process.env.SMTP_USER || '';
  const purposeLabel = payload.purpose
    ? payload.purpose.charAt(0).toUpperCase() + payload.purpose.slice(1)
    : 'General';

  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
    to: ownerEmail,
    replyTo: payload.email,
    subject: `Portfolio message from ${payload.name} (${purposeLabel})`,
    html: buildOwnerEmail(payload),
  });
}

export async function sendContactEmail(payload: ContactPayload): Promise<SendResult> {
  // Attempt 1
  try {
    await trySend(payload);
    return { ok: true };
  } catch (err1: any) {
    console.error('[Mailer] Attempt 1 failed:', err1?.message);
    // Retry once after 2s
    await new Promise((r) => setTimeout(r, 2000));
    try {
      await trySend(payload);
      return { ok: true };
    } catch (err2: any) {
      const errorMsg = err2?.message || 'Unknown SMTP error';
      console.error('[Mailer] Attempt 2 failed:', errorMsg);
      // Store for admin retry
      failedStore.push({
        payload,
        failedAt: new Date().toISOString(),
        attempts: 2,
        error: errorMsg,
      });
      return { ok: false, error: errorMsg };
    }
  }
}

export async function sendAutoReply(name: string, email: string): Promise<void> {
  if (process.env.AUTO_REPLY_ENABLED !== 'true') return;
  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: `"Ajay's Portfolio" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Got your message, ${name}!`,
      html: buildAutoReply(name),
    });
  } catch (err: any) {
    // Auto-reply failure is non-critical; log only
    console.warn('[Mailer] Auto-reply failed (non-critical):', err?.message);
  }
}
