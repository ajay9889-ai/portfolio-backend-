/**
 * sessionContactLimit.ts
 * In-memory per-session limiter enforcing maximum 2 contact messages per session.
 * Protects Ajay's inbox from spam bursts while keeping good UX.
 */

import { Request, Response, NextFunction } from 'express';

interface SessionRecord {
  count: number;
  lastUpdated: number;
}

const sessionStore = new Map<string, SessionRecord>();

// Clean up stale sessions every 30 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  for (const [id, record] of sessionStore.entries()) {
    if (now - record.lastUpdated > maxAge) {
      sessionStore.delete(id);
    }
  }
}, 30 * 60 * 1000);

export function getSessionContactCount(sessionId: string): number {
  return sessionStore.get(sessionId)?.count || 0;
}

export function incrementSessionContactCount(sessionId: string): void {
  const current = sessionStore.get(sessionId);
  if (current) {
    current.count += 1;
    current.lastUpdated = Date.now();
  } else {
    sessionStore.set(sessionId, { count: 1, lastUpdated: Date.now() });
  }
}

export const sessionContactLimit = (req: Request, res: Response, next: NextFunction): void => {
  const sessionId = (req.body?.sessionId || req.headers['x-session-id'] || 'default-session') as string;
  const count = getSessionContactCount(sessionId);

  if (count >= 2) {
    res.status(429).json({
      ok: false,
      error: "You've already sent two messages this session. Ajay will review them promptly! Feel free to email directly at ajayhasrb123@gmail.com.",
      code: 'SESSION_LIMIT_EXCEEDED',
    });
    return;
  }

  next();
};
