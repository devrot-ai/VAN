/**
 * Weather module — adapter-pattern architecture.
 *
 * The weather API is now decoupled from the page layer through a provider
 * interface. The Open-Meteo implementation is one adapter; a mock adapter
 * enables testing. Caching sits at the seam between the adapter and the caller.
 *
 * Architecture depth:
 * - `lib/weather/types.ts` — shared type definitions
 * - `lib/weather/provider.ts` — WeatherProvider interface + cache layer
 * - `lib/weather/openmeteo.ts` — Open-Meteo API adapter
 * - `lib/weather/mock.ts` — Mock adapter for testing
 * - `lib/weather/service.ts` — singleton that wires provider + cache
 *
 * If Open-Meteo changes, swap the adapter without touching the page.
 * If you need caching, it's already there. If you need a mock, it's ready.
 */

// Re-export everything from the new modular structure.
// Existing imports like `import { getWeatherForPlace, type WeatherForPlace } from "@/lib/weather"`
// continue to work without changes.
export {
  getWeatherForPlace,
  clearWeatherCache,
  OpenMeteoWeatherProvider,
  MockWeatherProvider,
} from "./weather/service";

export type {
  WeatherForPlace,
  WeatherNow,
  WeatherDay,
  WeatherProvider,
} from "./weather/service";
