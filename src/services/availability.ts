/**
 * availability.ts
 * Reads availability config from environment variables.
 * Module-level cache (60s) prevents hammering env on each SSE message.
 * Updating availability: change env vars in Render → service restarts → done.
 */

export type AvailabilityStatus = 'available' | 'busy' | 'away';

export interface AvailabilityConfig {
  status: AvailabilityStatus;
  note: string;
  workingHours: string;
  preferredRoles: string[];
  calendlyUrl?: string;
  updatedAt: string;
}

let cache: AvailabilityConfig | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

const VALID_STATUSES: AvailabilityStatus[] = ['available', 'busy', 'away'];

function parseStatus(raw?: string): AvailabilityStatus {
  const s = (raw ?? '').toLowerCase().trim() as AvailabilityStatus;
  return VALID_STATUSES.includes(s) ? s : 'available';
}

export function getAvailability(): AvailabilityConfig {
  const now = Date.now();
  if (cache && now < cacheExpiry) return cache;

  const config: AvailabilityConfig = {
    status: parseStatus(process.env.AVAILABILITY_STATUS),
    note: process.env.AVAILABILITY_NOTE?.trim() || 'Open to full-time and freelance roles',
    workingHours: process.env.WORKING_HOURS?.trim() || 'Mon–Fri, 10am–7pm IST',
    preferredRoles: (process.env.PREFERRED_ROLES ?? 'Full-Stack Engineer,AI Systems Engineer')
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean),
    calendlyUrl: process.env.CALENDLY_URL?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  cache = config;
  cacheExpiry = now + CACHE_TTL_MS;
  return config;
}

/** Human-readable string for use in chat responses */
export function availabilityToText(config: AvailabilityConfig): string {
  const statusMap: Record<AvailabilityStatus, string> = {
    available: 'currently open to new opportunities',
    busy: 'currently busy with active projects but open to the right opportunity',
    away: 'temporarily unavailable but checking messages periodically',
  };
  const roles = config.preferredRoles.join(' and ');
  const hours = config.workingHours;
  const calendly = config.calendlyUrl
    ? ` You can also schedule a call via Calendly.`
    : '';
  return `Ajay is ${statusMap[config.status]}. He's particularly interested in ${roles} roles. Working hours: ${hours} IST.${calendly} ${config.note}.`;
}
