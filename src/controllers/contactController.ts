/**
 * contactController.ts
 * Upgraded production contact controller with:
 *   - Honeypot check ('website' hidden field)
 *   - Disposable email & link-count spam guard
 *   - In-memory per-session contact limiting
 *   - Input sanitization & Zod schema validation
 *   - Nodemailer delivery with single-retry via mailer service
 *   - Backing store with sent/failed status logging
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { checkSpam } from '../services/spamGuard.js';
import { sendContactEmail, sendAutoReply, getFailedMessages, type ContactPayload } from '../services/mailer.js';
import { incrementSessionContactCount } from '../middleware/sessionContactLimit.js';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  subject: z.string().min(3).max(200).optional().default('General Inquiry'),
  company: z.string().max(100).optional(),
  purpose: z.enum(['hiring', 'freelance', 'collaboration', 'other']).optional().default('other'),
  sessionId: z.string().optional(),
  website: z.string().optional(), // Honeypot field
});

export interface StoredContactMessage extends ContactPayload {
  status: 'sent' | 'failed';
  ipMasked?: string;
}

// In-memory messages audit log
const messagesStore: StoredContactMessage[] = [];

/** Mask IP for privacy (e.g. 192.168.1.100 -> 192.168.***.***) */
function maskIp(ip?: string): string {
  if (!ip) return 'unknown';
  const parts = ip.split('.');
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
  return ip.slice(0, 8) + '***';
}

/** Sanitize input strings to prevent HTML injection */
function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  // 1. Honeypot check — if a bot filled the hidden 'website' field, silently succeed without sending
  if (req.body?.website && typeof req.body.website === 'string' && req.body.website.trim().length > 0) {
    console.log('[Contact] Honeypot triggered — ignoring bot submission silently.');
    res.status(200).json({
      success: true,
      ok: true,
      message: 'Thank you for reaching out! Your message has been received.',
    });
    return;
  }

  // 2. Validate input schema
  const parseResult = contactSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      ok: false,
      error: 'Validation failed',
      details: parseResult.error.format(),
    });
    return;
  }

  const { name, email, message, subject, company, purpose, sessionId } = parseResult.data;

  // 3. Spam Guard
  const spamResult = checkSpam({ message, email, sessionId });
  if (spamResult.spam) {
    console.warn(`[Contact Spam] Blocked (${spamResult.code}): ${spamResult.reason}`);
    res.status(400).json({
      success: false,
      ok: false,
      code: spamResult.code,
      error: spamResult.reason || 'Message flagged as suspicious. Please provide a standard email without excessive links.',
    });
    return;
  }

  // 4. Sanitize
  const cleanName = sanitize(name);
  const cleanEmail = sanitize(email);
  const cleanMessage = sanitize(message);
  const cleanCompany = company ? sanitize(company) : undefined;
  const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || req.socket.remoteAddress;

  const payload: ContactPayload = {
    id: 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    name: cleanName,
    email: cleanEmail,
    message: cleanMessage,
    company: cleanCompany,
    purpose,
    sessionId,
    ip: rawIp,
    createdAt: new Date().toISOString(),
  };

  // 5. Send via Mailer (with retry)
  const sendRes = await sendContactEmail(payload);

  const stored: StoredContactMessage = {
    ...payload,
    status: sendRes.ok ? 'sent' : 'failed',
    ipMasked: maskIp(rawIp),
  };
  messagesStore.push(stored);

  console.log(`[Contact] From: ${cleanName} ip: ${maskIp(rawIp)} purpose: ${purpose} status: ${stored.status}`);

  if (sendRes.ok) {
    if (sessionId) incrementSessionContactCount(sessionId);
    // Fire optional visitor auto-reply
    sendAutoReply(cleanName, cleanEmail);

    res.status(201).json({
      success: true,
      ok: true,
      message: 'Thank you for reaching out! Ajay has received your message and will reply shortly.',
      data: {
        id: payload.id,
        receivedAt: payload.createdAt,
      },
    });
  } else {
    // Both attempts failed: stored in failedStore, return friendly fallback
    res.status(500).json({
      success: false,
      ok: false,
      code: 'DELIVERY_DELAYED',
      error: 'Message delivery encountered a temporary network delay. Your message is saved and queued for retry, or you can email ajayhasrb123@gmail.com directly.',
      fallbackEmail: 'ajayhasrb123@gmail.com',
      linkedIn: 'https://linkedin.com/in/ajay-a',
    });
  }
};

export const getContactSubmissions = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    count: messagesStore.length,
    data: messagesStore,
    failedQueueCount: getFailedMessages().length,
  });
};
