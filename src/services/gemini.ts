/**
 * gemini.ts
 * Robust Gemini API client supporting SSE streaming, function/tool calling,
 * timeout handling, and automatic offline fallback.
 */

import { SYSTEM_INSTRUCTION, getIntelligentPortfolioReply } from './offlineKb.js';
import { PORTFOLIO_TOOLS } from './tools.js';
import { getAvailability, availabilityToText } from './availability.js';

export interface ChatMessage {
  sender: 'user' | 'assistant' | 'system';
  text: string;
}

export type StreamEvent =
  | { type: 'token'; value: string }
  | { type: 'action'; name: string; args: Record<string, unknown> }
  | { type: 'done'; reply: string; source: 'gemini' | 'offline' }
  | { type: 'error'; error: string };

const GEMINI_MODEL = 'gemini-1.5-flash';

/**
 * Builds Gemini contents structure from conversation history
 */
function buildGeminiContents(
  messages: ChatMessage[],
  lang: string = 'en-US',
  mode: string = 'chat'
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  // Sliding window of last 8 messages
  for (const item of messages.slice(-8)) {
    if (item.sender === 'user') {
      contents.push({ role: 'user', parts: [{ text: item.text }] });
    } else if (item.sender === 'assistant') {
      contents.push({ role: 'model', parts: [{ text: item.text }] });
    }
  }

  // If in voice mode, append instruction hint to last user query if available
  if (mode === 'voice' && contents.length > 0) {
    const last = contents[contents.length - 1];
    if (last.role === 'user') {
      last.parts[0].text += `\n[Context: Voice interaction, language: ${lang}. Respond in maximum 2 concise spoken sentences without markdown formatting.]`;
    }
  }

  return contents;
}

/**
 * Check if a user query directly requests availability
 */
function isAvailabilityQuery(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes('available') ||
    t.includes('availability') ||
    t.includes('working hours') ||
    t.includes('free to work') ||
    t.includes('hiring status')
  );
}

function parseSendMailQuery(text: string): { isIntent: boolean; hasMessage: boolean; message?: string } {
  const t = text.trim();
  const lower = t.toLowerCase();

  const directIntents = [
    'send message',
    'send mail',
    'send email',
    'mail him',
    'mail ajay',
    'email ajay',
    'email him',
    'send a mail',
    'send a message',
    'send an email',
    'i want to send a mail',
    'i want to message him',
    'i want to send a message',
    'i want to email ajay',
    'message ajay',
    'write to ajay',
  ];

  if (directIntents.includes(lower)) {
    return { isIntent: true, hasMessage: false };
  }

  const prefixRegex = /^(?:please\s+)?(?:can\s+you\s+)?(?:i\s+want\s+to\s+)?(?:send\s+(?:a\s+)?(?:mail|message|email)(?:\s+to\s+ajay)?|mail\s+(?:ajay|him)|email\s+(?:ajay|him))\s*(?:saying|that|:)?\s*/i;

  if (prefixRegex.test(t)) {
    const remainder = t.replace(prefixRegex, '').trim();
    if (remainder.length >= 3) {
      return { isIntent: true, hasMessage: true, message: remainder };
    }
    return { isIntent: true, hasMessage: false };
  }

  return { isIntent: false, hasMessage: false };
}

function isQuestionOrInquiry(text: string): boolean {
  const t = text.toLowerCase().trim();
  if (t.endsWith('?')) return true;

  const patterns = [
    /^(what|who|where|when|why|how|which|can\s+you|could\s+you|tell\s+me|explain|show|give\s+me|is\s+he|is\s+ajay|are\s+you)\b/i,
    /\b(eldernest|wisdomplay|smart\s+attendance|attendance|hackverse|brikup)\b/i,
    /\b(tech\s+stack|technologies|skills|skill|languages|frameworks|experience|education|degree|college|bmsit|bca|mca)\b/i,
    /\b(projects|project|portfolio|github|linkedin|resume|cv|contact|email|phone|location|bengaluru|bangalore)\b/i,
    /\b(available|availability|free|busy|open\s+to\s+work|hire)\b/i,
    /\b(about\s+ajay|about\s+you|yourself|introduce)\b/i,
    /^(hi|hello|hey|greetings|namaste|good\s+(morning|afternoon|evening))\b/i,
  ];

  return patterns.some((p) => p.test(t));
}

/**
 * Generate a complete chat response (non-streaming)
 */
export async function generateChat(
  messages: ChatMessage[],
  lang: string = 'en-US',
  mode: string = 'chat'
): Promise<{ reply: string; action?: { name: string; args: Record<string, unknown> }; source: 'gemini' | 'offline' }> {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  const lastUserMsg = messages.filter((m) => m.sender === 'user').pop()?.text || '';

  if (isAvailabilityQuery(lastUserMsg)) {
    const avail = getAvailability();
    return {
      reply: `${availabilityToText(avail)} Would you like to leave a message for him?`,
      source: 'offline',
    };
  }

  const lowerMsg = lastUserMsg.toLowerCase().trim();
  if (lowerMsg === 'cancel' || lowerMsg === 'nevermind' || lowerMsg === 'never mind' || lowerMsg === 'clear' || lowerMsg === 'stop') {
    return {
      reply: "No problem! I've cleared the message draft. What would you like to know about Ajay's projects, tech stack, or experience?",
      action: { name: 'clear_lead_draft', args: {} },
      source: 'offline',
    };
  }

  const lastAssistantMsg = [...messages].reverse().find((m) => m.sender === 'assistant')?.text || '';
  const isAwaitingMessage =
    lastAssistantMsg.toLowerCase().includes('what message would you like to send') ||
    lastAssistantMsg.toLowerCase().includes('what message should i send');
  const isAwaitingDetails =
    lastAssistantMsg.toLowerCase().includes('please provide your email address') ||
    lastAssistantMsg.toLowerCase().includes('please type your mailid and name') ||
    lastAssistantMsg.toLowerCase().includes('enter email and name');

  if (isAwaitingMessage && !isQuestionOrInquiry(lastUserMsg) && lastUserMsg.trim().length > 2) {
    const userMsg = lastUserMsg.trim();
    return {
      reply: `Got your message: "${userMsg}". Please provide your email address and name so Ajay can reply to you.`,
      action: { name: 'request_contact_details', args: { message: userMsg } },
      source: 'offline',
    };
  }

  if (isAwaitingDetails) {
    const emailMatch = lastUserMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      const email = emailMatch[0];
      const name = lastUserMsg.replace(email, '').replace(/\b(?:my\s+name\s+is|my\s+name|name\s+is|my\s+email\s+is|email|name|is|and)\b/gi, '').replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).slice(0, 3).join(' ') || 'Visitor';
      return {
        reply: `Thank you ${name}! I've prepared your message with email ${email}. Please review and click Send to deliver it to Ajay!`,
        action: { name: 'send_message_to_ajay', args: { email, name } },
        source: 'offline',
      };
    }
  }

  const mailParsed = parseSendMailQuery(lastUserMsg);
  if (mailParsed.isIntent) {
    if (mailParsed.hasMessage && mailParsed.message) {
      return {
        reply: `Got your message: "${mailParsed.message}". Please provide your email address and name so Ajay can reply to you.`,
        action: { name: 'request_contact_details', args: { message: mailParsed.message } },
        source: 'offline',
      };
    } else {
      return {
        reply: "What message would you like to send to Ajay? Please tell or type your message.",
        action: { name: 'request_contact_message', args: {} },
        source: 'offline',
      };
    }
  }

  if (apiKey && apiKey.length > 10) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
      const contents = buildGeminiContents(messages, lang, mode);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          tools: [{ functionDeclarations: PORTFOLIO_TOOLS }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.9,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = (await res.json()) as any;
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts || [];

        let text = '';
        let action: { name: string; args: Record<string, unknown> } | undefined;

        for (const part of parts) {
          if (part.text) {
            text += part.text;
          }
          if (part.functionCall) {
            const { name, args } = part.functionCall;
            if (name === 'get_availability') {
              const avail = getAvailability();
              text += ` ${availabilityToText(avail)}`;
            } else {
              action = { name, args: args || {} };
            }
          }
        }

        if (text.trim() || action) {
          return {
            reply: text.trim() || (action?.name === 'send_message_to_ajay' ? "I've prepared your message for Ajay. Please confirm on screen!" : "Here you go!"),
            action,
            source: 'gemini',
          };
        }
      }
    } catch (err) {
      console.warn('[Gemini] Non-stream error or timeout, falling back:', err);
    }
  }

  // Fallback to offline KB
  const reply = getIntelligentPortfolioReply(lastUserMsg);
  return { reply, source: 'offline' };
}

/**
 * Async generator for streaming SSE responses from Gemini or fallback
 */
export async function* streamChat(
  messages: ChatMessage[],
  lang: string = 'en-US',
  mode: string = 'chat',
  signal?: AbortSignal
): AsyncGenerator<StreamEvent> {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
  const lastUserMsg = messages.filter((m) => m.sender === 'user').pop()?.text || '';


  // Check the last assistant message to detect multi-turn contact flow
  const lastAssistantMsg = [...messages].reverse().find((m) => m.sender === 'assistant')?.text || '';
  const isAwaitingMessage =
    lastAssistantMsg.toLowerCase().includes('what message would you like to send') ||
    lastAssistantMsg.toLowerCase().includes('what message should i send');
  const isAwaitingDetails =
    lastAssistantMsg.toLowerCase().includes('please provide your email address') ||
    lastAssistantMsg.toLowerCase().includes('please type your mailid and name') ||
    lastAssistantMsg.toLowerCase().includes('enter email and name');

  const streamLowerMsg = lastUserMsg.toLowerCase().trim();
  if (streamLowerMsg === 'cancel' || streamLowerMsg === 'nevermind' || streamLowerMsg === 'never mind' || streamLowerMsg === 'clear' || streamLowerMsg === 'stop') {
    const reply = "No problem! I've cleared the message draft. What would you like to know about Ajay's projects, tech stack, or experience?";
    for (const word of reply.split(' ')) {
      yield { type: 'token', value: word + ' ' };
    }
    yield { type: 'action', name: 'clear_lead_draft', args: {} };
    yield { type: 'done', reply, source: 'offline' };
    return;
  }

  // Direct fast-path for availability
  if (isAvailabilityQuery(lastUserMsg)) {
    const avail = getAvailability();
    const reply = `${availabilityToText(avail)} Would you like me to send him a message?`;
    for (const word of reply.split(' ')) {
      yield { type: 'token', value: word + ' ' };
    }
    yield { type: 'done', reply, source: 'offline' };
    return;
  }

  // Multi-turn: user providing message in response to "what message would you like to send"
  if (isAwaitingMessage && !isQuestionOrInquiry(lastUserMsg) && lastUserMsg.trim().length > 2) {
    const userMsg = lastUserMsg.trim();
    const reply = `Got your message: "${userMsg}". Please provide your email address and name so Ajay can reply to you.`;
    for (const word of reply.split(' ')) {
      yield { type: 'token', value: word + ' ' };
    }
    yield {
      type: 'action',
      name: 'request_contact_details',
      args: { message: userMsg },
    };
    yield { type: 'done', reply, source: 'offline' };
    return;
  }

  // Multi-turn: user providing email and name in response to details request
  if (isAwaitingDetails) {
    const emailMatch = lastUserMsg.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      const email = emailMatch[0];
      const name = lastUserMsg.replace(email, '').replace(/\b(?:my\s+name\s+is|my\s+name|name\s+is|my\s+email\s+is|email|name|is|and)\b/gi, '').replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).slice(0, 3).join(' ') || 'Visitor';
      const reply = `Thank you ${name}! I've prepared your message with email ${email}. Please review and click Send to deliver it to Ajay!`;
      for (const word of reply.split(' ')) {
        yield { type: 'token', value: word + ' ' };
      }
      yield {
        type: 'action',
        name: 'send_message_to_ajay',
        args: { email, name },
      };
      yield { type: 'done', reply, source: 'offline' };
      return;
    }
  }

  // Direct fast-path for sending mail intent
  const mailParsed = parseSendMailQuery(lastUserMsg);
  if (mailParsed.isIntent) {
    if (mailParsed.hasMessage && mailParsed.message) {
      const reply = `Got your message: "${mailParsed.message}". Please provide your email address and name so Ajay can reply to you.`;
      for (const word of reply.split(' ')) {
        yield { type: 'token', value: word + ' ' };
      }
      yield {
        type: 'action',
        name: 'request_contact_details',
        args: { message: mailParsed.message },
      };
      yield { type: 'done', reply, source: 'offline' };
      return;
    } else {
      const reply = "What message would you like to send to Ajay? Please tell or type your message.";
      for (const word of reply.split(' ')) {
        yield { type: 'token', value: word + ' ' };
      }
      yield { type: 'action', name: 'request_contact_message', args: {} };
      yield { type: 'done', reply, source: 'offline' };
      return;
    }
  }

  if (apiKey && apiKey.length > 10) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const contents = buildGeminiContents(messages, lang, mode);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const onParentAbort = () => controller.abort();
      if (signal) signal.addEventListener('abort', onParentAbort);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          tools: [{ functionDeclarations: PORTFOLIO_TOOLS }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
            topP: 0.9,
          },
        }),
      });

      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onParentAbort);

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullReply = '';
        let actionEmitted = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonStr);
              const parts = data.candidates?.[0]?.content?.parts || [];

              for (const part of parts) {
                if (part.text) {
                  fullReply += part.text;
                  yield { type: 'token', value: part.text };
                }
                if (part.functionCall) {
                  const { name, args } = part.functionCall;
                  if (name === 'get_availability') {
                    const avail = getAvailability();
                    const availText = ` ${availabilityToText(avail)}`;
                    fullReply += availText;
                    yield { type: 'token', value: availText };
                  } else {
                    yield { type: 'action', name, args: args || {} };
                    actionEmitted = true;
                  }
                }
              }
            } catch {
              // Parse error for partial chunk, ignore
            }
          }
        }

        if (fullReply.trim() || actionEmitted) {
          yield { type: 'done', reply: fullReply.trim(), source: 'gemini' };
          return;
        }
      }
    } catch (err) {
      console.warn('[Gemini] Stream error, failing over to offline engine:', err);
    }
  }

  // Graceful offline fallback
  const fallbackReply = getIntelligentPortfolioReply(lastUserMsg);
  // Yield in natural word chunks for typing simulation
  const words = fallbackReply.split(' ');
  for (let i = 0; i < words.length; i++) {
    yield { type: 'token', value: words[i] + (i < words.length - 1 ? ' ' : '') };
  }
  yield { type: 'done', reply: fallbackReply, source: 'offline' };
}
