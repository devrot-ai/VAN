/**
 * Weather service — singleton that wires the provider, cache, and public API.
 *
 * This module initializes the weather system once at import time. Pages call
 * `getWeatherForPlace()` which goes through the cache → provider chain.
 *
 * To swap providers (e.g., for testing), set the WEATHER_MOCK env var or
 * call `initWeatherService()` directly.
 */

import { initWeatherService as initCache, getWeather as getCachedWeather, clearWeatherCache } from "./provider";
import { OpenMeteoWeatherProvider } from "./openmeteo";
import { MockWeatherProvider } from "./mock";

// Initialize once — use mock if env var is set, otherwise use real API
const useMock = process.env.WEATHER_MOCK === "true";
const provider = useMock ? new MockWeatherProvider() : new OpenMeteoWeatherProvider();
initCache(provider);

/**
 * Get weather for a location string. This is the main entry point — pages
 * call this function, and it goes through cache → provider automatically.
 *
 * @param query - Location name (e.g., "Pune, India")
 * @returns Weather data or null if unavailable
 */
export async function getWeatherForPlace(query: string) {
  const clean = query.trim();
  if (!clean) return null;
  return getCachedWeather(clean);
}

/**
 * Clear the weather cache. Useful for testing or manual refresh.
 */
export { clearWeatherCache };

// Re-export types for convenience
export type { WeatherForPlace, WeatherNow, WeatherDay } from "./types";
export type { WeatherProvider } from "./provider";

// Re-export providers for testing
export { OpenMeteoWeatherProvider, MockWeatherProvider };
