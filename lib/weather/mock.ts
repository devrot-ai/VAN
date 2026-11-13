/**
 * Mock weather provider — returns deterministic data for testing.
 *
 * Use this in tests or development to avoid hitting the real API.
 * Swapping to the mock requires only changing the provider in initWeatherService().
 */

import type { WeatherProvider } from "./provider";
import type { WeatherForPlace } from "./types";

export class MockWeatherProvider implements WeatherProvider {
  constructor(
    private mockData: WeatherForPlace | null = {
      place: "Mock City, Test Country",
      now: {
        temperature: 22,
        humidity: 65,
        windSpeed: 12,
        precipitation: 0,
        observedAt: "2026-11-13T12:00:00",
      },
      days: [
        { date: "2026-11-13", tempMax: 24, tempMin: 18, precipitation: 0 },
        { date: "2026-11-14", tempMax: 22, tempMin: 16, precipitation: 2.5 },
        { date: "2026-11-15", tempMax: 20, tempMin: 14, precipitation: 5.0 },
        { date: "2026-11-16", tempMax: 23, tempMin: 17, precipitation: 0 },
      ],
    },
  ) {}

  async getWeather(_query: string): Promise<WeatherForPlace | null> {
    // Simulate async without actual network call
    return Promise.resolve(this.mockData);
  }
}
