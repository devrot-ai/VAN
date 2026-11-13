/**
 * lib/config.ts — Immutable application configuration.
 *
 * Inspired by OpenHands SDK immutable configuration pattern.
 * All env vars, feature flags, and settings are validated once at startup
 * and exposed as a single immutable object. No scattered process.env calls.
 */

/* ---------- Types ---------- */

export interface AppConfig {
  // Environment
  nodeEnv: "development" | "production" | "test"
  port: number
  baseUrl: string

  // Database
  dbPath: string

  // Auth
  sessionSecret: string
  sessionMaxAge: number // ms
  rateLimitWindowMs: number
  rateLimitMax: number

  // Email
  mailFrom: string
  mailHost: string | null
  mailPort: number | null
  mailUser: string | null
  mailPass: string | null

  // Weather
  weatherMock: boolean
  weatherCacheTtlMs: number

  // AI Chat
  geminiApiKey: string | null
  geminiModel: string

  // Feature flags
  features: {
    notifications: boolean
    analytics: boolean
    aiChat: boolean
  }
}

/* ---------- Validation ---------- */

function requiredEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

function optionalEnv(key: string): string | null {
  return process.env[key] ?? null
}

function envBool(key: string, defaultVal = false): boolean {
  const val = process.env[key]
  if (val === undefined) return defaultVal
  return val === "true" || val === "1"
}

function envNum(key: string, defaultVal: number): number {
  const val = process.env[key]
  if (!val) return defaultVal
  const n = Number(val)
  if (isNaN(n)) return defaultVal
  return n
}

/* ---------- Config Singleton ---------- */

let _config: AppConfig | null = null
let initialized = false

export function initConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  if (initialized) return _config!

  const nodeEnv = (process.env.NODE_ENV ?? "development") as AppConfig["nodeEnv"]

  _config = {
    // Environment
    nodeEnv,
    port: envNum("PORT", 3000),
    baseUrl: process.env.BASE_URL ?? `http://localhost:${envNum("PORT", 3000)}`,

    // Database
    dbPath: process.env.DB_PATH ?? "./data/van.db",

    // Auth
    sessionSecret: requiredEnv("SESSION_SECRET"),
    sessionMaxAge: envNum("SESSION_MAX_AGE", 7 * 24 * 60 * 60 * 1000), // 7 days
    rateLimitWindowMs: envNum("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000), // 15 min
    rateLimitMax: envNum("RATE_LIMIT_MAX", 100),

    // Email
    mailFrom: process.env.MAIL_FROM ?? "noreply@van.local",
    mailHost: optionalEnv("MAIL_HOST"),
    mailPort: process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : null,
    mailUser: optionalEnv("MAIL_USER"),
    mailPass: optionalEnv("MAIL_PASS"),

    // Weather
    weatherMock: envBool("WEATHER_MOCK", nodeEnv === "test"),
    weatherCacheTtlMs: envNum("WEATHER_CACHE_TTL_MS", 15 * 60 * 1000), // 15 min

    // AI Chat
    geminiApiKey: optionalEnv("GEMINI_API_KEY"),
    geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",

    // Feature flags
    features: {
      notifications: envBool("FEATURE_NOTIFICATIONS", true),
      analytics: envBool("FEATURE_ANALYTICS", true),
      aiChat: !!process.env.GEMINI_API_KEY,
    },
  }

  // Apply overrides (useful for testing)
  if (overrides) {
    _config = { ..._config, ...overrides } as AppConfig
    if (overrides.features) {
      _config!.features = { ..._config!.features, ...overrides.features }
    }
  }

  // Make immutable — freeze inner objects first, then the parent
  _config!.features = Object.freeze(_config!.features)
  _config = Object.freeze(_config!)
  initialized = true

  return _config!
}

export function getConfig(): AppConfig {
  if (!initialized) {
    return initConfig()
  }
  return _config!
}

// Auto-initialize on import
const _autoConfig = initConfig()
export const config = _autoConfig
