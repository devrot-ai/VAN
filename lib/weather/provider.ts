/**
 * Weather provider interface — decouples the weather API from the page layer.
 *
 * Any implementation of this interface can be swapped in without touching
 * WeatherPanel or the intelligence page. A mock provider enables testing;
 * a real provider handles the external API call.
 *
 * Architecture depth: The seam between "weather data source" and "weather UI"
 * is now at this interface. Changing the API, adding caching, or swapping
 * providers touches only the adapter layer, not the page.
 */

import type { WeatherForPlace } from "./types";

/**
 * Abstract weather provider — implement this to add a new weather data source.
 */
export interface WeatherProvider {
  /**
   * Fetch current weather and short forecast for a location string.
   * Returns null if the location is unknown or the service is unavailable.
   */
  getWeather(query: string): Promise<WeatherForPlace | null>;
}

/**
 * In-memory cache layer — sits between the provider and the caller.
 *
 * Caches results by location query string with a configurable TTL.
 * This prevents repeated API calls within the TTL window.
 */
export interface WeatherCache {
  /** Get cached result or fetch from provider and cache it. */
  get(query: string): Promise<WeatherForPlace | null>;
  /** Clear all cached entries. */
  clear(): void;
}

/**
 * Simple in-memory LRU-style cache with TTL.
 */
class InMemoryCache implements WeatherCache {
  private cache = new Map<string, { data: WeatherForPlace | null; expiresAt: number }>();

  constructor(private ttlMs: number = 15 * 60 * 1000) {}

  async get(query: string): Promise<WeatherForPlace | null> {
    const cached = this.cache.get(query);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    // Not cached or expired — fetch from provider
    const data = await this.fetchFromProvider(query);
    this.cache.set(query, { data, expiresAt: Date.now() + this.ttlMs });
    return data;
  }

  clear(): void {
    this.cache.clear();
  }

  private async fetchFromProvider(query: string): Promise<WeatherForPlace | null> {
    return await provider.getWeather(query);
  }
}

// ---------------------------------------------------------------------------
// Provider registry — swap implementations here, not in pages
// ---------------------------------------------------------------------------

let provider: WeatherProvider = null as any;
let cache: WeatherCache = null as any;

/**
 * Initialize the weather service with a specific provider.
 * Call once at module load time.
 */
export function initWeatherService(p: WeatherProvider, ttlMs?: number): void {
  provider = p;
  cache = new InMemoryCache(ttlMs);
}

/**
 * Get weather for a location. Uses the cached provider layer.
 * This is the only function pages should call.
 */
export async function getWeather(query: string): Promise<WeatherForPlace | null> {
  if (!provider) {
    console.warn("[weather] Weather service not initialized — no provider configured.");
    return null;
  }
  return cache.get(query);
}

/**
 * Clear the weather cache. Useful for testing or manual refresh.
 */
export function clearWeatherCache(): void {
  if (cache) cache.clear();
}
