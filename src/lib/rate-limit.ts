import { headers } from "next/headers";

/**
 * In-memory rate limiting for public server actions.
 *
 * A fixed-window counter per key, kept in a `Map` rather than Redis — this is
 * a single-instance Node process, and the whole point of every "stays light"
 * decision elsewhere in this codebase is not reaching for infrastructure a
 * small business site doesn't need yet. The real limitation this trades away:
 * counts reset on a server restart and don't share across instances if this
 * ever runs behind more than one. Revisit with Upstash/Redis if that changes.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Opportunistic cleanup so a flood of distinct keys (rotating IPs, spoofed emails) can't grow this unboundedly. */
const MAX_BUCKETS = 20_000;
const sweepExpired = (now: number) => {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
};

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the caller can retry. Only set when `ok` is false. */
  retryAfterSeconds?: number;
}

/**
 * Checks and consumes one unit against `key`'s window, creating it on first use.
 *
 * Call once per identifier that should independently gate the action — e.g.
 * both the requester's IP and the email address they typed — so an attacker
 * can't bypass a per-victim limit just by rotating IPs, or bypass a per-IP
 * limit by rotating emails.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_BUCKETS) sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true };
}

/**
 * The requester's IP from the standard proxy headers, falling back to a
 * constant so a missing header degrades to "everyone shares one bucket"
 * rather than to "no limit at all."
 */
export async function getClientIp(): Promise<string> {
  const list = await headers();
  const forwardedFor = list.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return list.get("x-real-ip") ?? "unknown";
}

/** A friendly message for the "please slow down" case, reusable across every form's error shape. */
export const rateLimitMessage = (retryAfterSeconds: number): string => {
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return minutes <= 1
    ? "Too many attempts. Please wait a minute and try again."
    : `Too many attempts. Please wait ${minutes} minutes and try again.`;
};
