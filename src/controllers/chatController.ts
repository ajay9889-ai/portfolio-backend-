/**
 * chatController.ts
 * Upgraded chat controller with:
 *   - POST /chat: Non-streaming fallback endpoint
 *   - POST /chat/stream: SSE streaming endpoint with token-by-token output, tool events, and telemetry
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { generateChat, streamChat, type ChatMessage } from '../services/gemini.js';
import { recordAnalyticsEvent, recordFeedbackVote } from '../middleware/analyticsMiddleware.js';

const chatRequestSchema = z.object({
  message: z.string().optional(),
  messages: z
    .array(
      z.object({
        sender: z.enum(['user', 'assistant', 'system']),
        text: z.string(),
      })
    )
    .optional(),
  history: z.array(z.any()).optional(),
  lang: z.string().optional().default('en-US'),
  mode: z.enum(['chat', 'voice']).optional().default('chat'),
  sessionId: z.string().optional(),
});

function normalizeMessages(reqBody: any): ChatMessage[] {
  if (Array.isArray(reqBody.messages) && reqBody.messages.length > 0) {
    return reqBody.messages;
  }

  const list: ChatMessage[] = [];
  if (Array.isArray(reqBody.history)) {
    for (const h of reqBody.history) {
      if (h.sender && h.text) {
        list.push({ sender: h.sender, text: h.text });
      }
    }
  }

  if (typeof reqBody.message === 'string' && reqBody.message.trim()) {
    list.push({ sender: 'user', text: reqBody.message.trim() });
  }

  return list;
}

/**
 * POST /api/v1/chat
 * Non-streaming chat endpoint (kept for backward compatibility & fallback)
 */
export const handleChat = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body', details: parsed.error.format() });
    return;
  }

  const messages = normalizeMessages(req.body);
  if (messages.length === 0) {
    res.status(400).json({ error: 'At least one message is required' });
    return;
  }

  const { lang, mode, sessionId } = parsed.data;
  const lastUserText = messages.filter((m) => m.sender === 'user').pop()?.text || '';

  try {
    const result = await generateChat(messages, lang, mode);
    const latencyMs = Date.now() - startTime;

    recordAnalyticsEvent({
      sessionId,
      lang,
      mode,
      source: result.source,
      latencyMs,
      question: lastUserText,
    });

    res.json({
      reply: result.reply,
      action: result.action,
      source: result.source,
    });
  } catch (err: any) {
    console.error('[ChatController] Error in handleChat:', err);
    res.json({
      reply: "Ajay A is a Full-Stack Developer based in Bengaluru specializing in React, Next.js, and AI systems. Feel free to connect at ajayhasrb123@gmail.com!",
      source: 'offline',
    });
  }
};

/**
 * POST /api/v1/chat/stream
 * Server-Sent Events (SSE) streaming endpoint
 */
export const handleChatStream = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid stream request body', details: parsed.error.format() });
    return;
  }

  const messages = normalizeMessages(req.body);
  if (messages.length === 0) {
    res.status(400).json({ error: 'At least one message is required' });
    return;
  }

  const { lang, mode, sessionId } = parsed.data;
  const lastUserText = messages.filter((m) => m.sender === 'user').pop()?.text || '';

  // Setup SSE response headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Keep-alive heartbeat
  res.write(': ping\n\n');

  const abortController = new AbortController();
  req.on('close', () => {
    abortController.abort();
  });

  let sourceUsed: 'gemini' | 'offline' = 'offline';
  let completeReply = '';

  try {
    for await (const event of streamChat(messages, lang, mode, abortController.signal)) {
      if (res.writableEnded) break;

      if (event.type === 'token') {
        completeReply += event.value;
      }
      if (event.type === 'done') {
        sourceUsed = event.source;
      }

      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }

    const latencyMs = Date.now() - startTime;
    recordAnalyticsEvent({
      sessionId,
      lang,
      mode,
      source: sourceUsed,
      latencyMs,
      question: lastUserText,
    });
  } catch (err: any) {
    console.error('[ChatController] Stream error:', err);
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'Stream interrupted' })}\n\n`);
    }
  } finally {
    if (!res.writableEnded) {
      res.end();
    }
  }
};

/**
 * POST /api/v1/chat/feedback
 * Records user feedback (thumbs up / down)
 */
export const handleChatFeedback = (req: Request, res: Response): void => {
  const { messageId, vote } = req.body;
  if (!messageId || (vote !== 'up' && vote !== 'down')) {
    res.status(400).json({ error: 'Valid messageId and vote (up|down) required' });
    return;
  }

  recordFeedbackVote(messageId, vote);
  res.json({ ok: true, messageId, vote });
};
