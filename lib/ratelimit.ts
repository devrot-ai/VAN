/**
 * In-memory sliding window rate limiter.
 *
 * Tracks attempts by key (IP for login, email for reset). Configurable limits
 * per route. Returns `{ allowed: boolean, retryAfter: number }` so the caller
 * can reject the request before it reaches the database.
 *
 * Limitation: state is lost on server restart. Acceptable for current scale;
 * a DB-backed limiter is future work.
 */

interface WindowEntry {
  timestamps: number[];
}

const store = new Map<string, WindowEntry>();

// Cleanup every hour to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < 3600 * 1000);
  }
}, 3600 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number; // seconds until next attempt is allowed
}

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  reset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
};

/**
 * Check whether a key is rate-limited.
 * @param route - The route identifier (login, register, reset)
 * @param key - The unique key (IP address, email, etc.)
 * @returns Whether the request is allowed and retry-after seconds
 */
export function checkRateLimit(route: string, key: string): RateLimitResult {
  const config = DEFAULT_CONFIGS[route] ?? DEFAULT_CONFIGS.login;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { timestamps: [now] });
    return { allowed: true, retryAfter: 0 };
  }

  // Prune expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs);

  if (entry.timestamps.length >= config.maxAttempts) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + config.windowMs - now) / 1000);
    return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
  }

  entry.timestamps.push(now);
  return { allowed: true, retryAfter: 0 };
}
