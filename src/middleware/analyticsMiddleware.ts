/**
 * analyticsMiddleware.ts
 * In-memory ring buffer (capped at 1000 entries) for conversational AI telemetry:
 * latency tracking, fallback rates, feedback votes, and popular queries.
 */

export interface AnalyticsEvent {
  id: string;
  timestamp: number;
  sessionId?: string;
  lang?: string;
  mode?: 'chat' | 'voice';
  source: 'gemini' | 'offline';
  latencyMs: number;
  question?: string;
  vote?: 'up' | 'down';
  error?: string;
}

const MAX_RING_BUFFER = 1000;
const ringBuffer: AnalyticsEvent[] = [];
let upvotes = 0;
let downvotes = 0;

export function recordAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
  const fullEvent: AnalyticsEvent = {
    ...event,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
  };

  if (ringBuffer.length >= MAX_RING_BUFFER) {
    ringBuffer.shift();
  }
  ringBuffer.push(fullEvent);
}

export function recordFeedbackVote(messageId: string, vote: 'up' | 'down'): void {
  if (vote === 'up') upvotes++;
  if (vote === 'down') downvotes++;
}

export function getAnalyticsSummary(): {
  totalEvents: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  fallbackRate: string;
  upvotes: number;
  downvotes: number;
  topQuestions: Array<{ question: string; count: number }>;
} {
  const total = ringBuffer.length;
  if (total === 0) {
    return {
      totalEvents: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      fallbackRate: '0%',
      upvotes,
      downvotes,
      topQuestions: [],
    };
  }

  const latencies = ringBuffer.map((e) => e.latencyMs).sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;

  const offlineCount = ringBuffer.filter((e) => e.source === 'offline').length;
  const fallbackRate = `${((offlineCount / total) * 100).toFixed(1)}%`;

  // Aggregate questions
  const qMap = new Map<string, number>();
  for (const ev of ringBuffer) {
    if (ev.question) {
      const q = ev.question.slice(0, 60).trim();
      qMap.set(q, (qMap.get(q) || 0) + 1);
    }
  }

  const topQuestions = Array.from(qMap.entries())
    .map(([question, count]) => ({ question, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEvents: total,
    p50LatencyMs: p50,
    p95LatencyMs: p95,
    fallbackRate,
    upvotes,
    downvotes,
    topQuestions,
  };
}
