/**
 * spamGuard.ts
 * Lightweight spam detection for contact form submissions.
 * No external deps — inlined blocklists and in-memory session hashes.
 */

/** Top disposable / throwaway email domains (inlined — no npm package needed) */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamailblock.com',
  'yopmail.com', 'temp-mail.org', 'tempmail.com', 'throwam.com', 'sharklasers.com',
  'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.de', 'grr.la', 'spam4.me',
  'trashmail.com', 'trashmail.me', 'trashmail.at', 'trashmail.io', 'dispostable.com',
  'mailnull.com', 'maildrop.cc', 'spamgourmet.com', 'spamgourmet.net', 'fakeinbox.com',
  'tempinbox.com', 'throwam.com', 'getairmail.com', 'mailzilla.com', 'mytrashmail.com',
  'trashmail.at', '10minutemail.com', '10minutemail.net', 'tempr.email', 'discard.email',
  'mohmal.com', 'mailtemp.net', 'crazymailing.com', 'filzmail.com',
]);

/** Per-session message hash tracking (cleared after 24h via interval in app.ts) */
const sessionHashes = new Map<string, Set<string>>();

export function clearOldSessionHashes(): void {
  // Called on server startup / interval; session-hash map grows slowly so clearing all is fine
  if (sessionHashes.size > 500) sessionHashes.clear();
}

function hashMessage(text: string): string {
  // Simple FNV-1a hash (fast, no deps)
  let h = 0x811c9dc5;
  const bytes = new TextEncoder().encode(text.toLowerCase().trim());
  for (const b of bytes) {
    h ^= b;
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}

function countLinks(text: string): number {
  const matches = text.match(/https?:\/\/\S+/gi);
  return matches ? matches.length : 0;
}

function extractEmailDomain(email: string): string {
  return (email.split('@')[1] ?? '').toLowerCase().trim();
}

export interface SpamGuardResult {
  spam: boolean;
  code?: string;
  reason?: string;
}

export interface SpamCheckInput {
  message: string;
  email: string;
  sessionId?: string;
}

export function checkSpam(input: SpamCheckInput): SpamGuardResult {
  const { message, email, sessionId } = input;

  // 1. Disposable email check
  const domain = extractEmailDomain(email);
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { spam: true, code: 'DISPOSABLE_EMAIL', reason: 'Disposable email address detected' };
  }

  // 2. Link count check (more than 2 links = likely spam)
  if (countLinks(message) > 2) {
    return { spam: true, code: 'TOO_MANY_LINKS', reason: 'Message contains too many links' };
  }

  // 3. Repeated message check per session
  if (sessionId) {
    const hash = hashMessage(message);
    let hashes = sessionHashes.get(sessionId);
    if (!hashes) {
      hashes = new Set();
      sessionHashes.set(sessionId, hashes);
    }
    if (hashes.has(hash)) {
      return { spam: true, code: 'DUPLICATE_MESSAGE', reason: 'Duplicate message in session' };
    }
    hashes.add(hash);
  }

  return { spam: false };
}

/** Clean session hashes for a given session ID on successful send */
export function clearSessionHash(sessionId: string): void {
  sessionHashes.delete(sessionId);
}
