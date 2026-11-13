/**
 * Open-Meteo weather provider — implements the WeatherProvider interface.
 *
 * This adapter wraps the Open-Meteo API (free, keyless). All external-call
 * logic lives here — the page layer never touches fetch() or API URLs.
 *
 * If Open-Meteo changes its API, only this file needs to change.
 */

import type { WeatherProvider } from "./provider";
import type { WeatherForPlace, WeatherNow, WeatherDay } from "./types";

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export class OpenMeteoWeatherProvider implements WeatherProvider {
  constructor(private timeoutMs = 6000) {}

  async getWeather(query: string): Promise<WeatherForPlace | null> {
    const place = await this.geocodePlace(query);
    if (!place) return null;

    const params = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
      daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
      forecast_days: "4",
      timezone: "auto",
    });

    const data = await this.fetchJson(`${FORECAST_URL}?${params.toString()}`);
    if (!data || typeof data !== "object") return null;

    const parsed = data as {
      current?: {
        time?: string;
        temperature_2m?: number;
        relative_humidity_2m?: number;
        precipitation?: number;
        wind_speed_10m?: number;
      };
      daily?: {
        time?: string[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        precipitation_sum?: (number | null)[];
      };
    };

    const current = parsed.current;
    const daily = parsed.daily;
    if (!current || typeof current.temperature_2m !== "number" || !daily?.time?.length) return null;

    const days: WeatherDay[] = daily.time.slice(0, 4).map((date, i) => ({
      date,
      tempMax: daily.temperature_2m_max?.[i] ?? 0,
      tempMin: daily.temperature_2m_min?.[i] ?? 0,
      precipitation: daily.precipitation_sum?.[i] ?? null,
    }));

    const now: WeatherNow = {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m ?? null,
      windSpeed: current.wind_speed_10m ?? null,
      precipitation: current.precipitation ?? null,
      observedAt: current.time ?? "",
    };

    return {
      place: [place.name, place.country].filter(Boolean).join(", "),
      now,
      days,
    };
  }

  private async geocodePlace(
    query: string,
  ): Promise<{ latitude: number; longitude: number; name: string; country?: string } | null> {
    const clean = query.trim();
    if (!clean) return null;
    const data = await this.fetchJson(
      `${GEOCODE_URL}?name=${encodeURIComponent(clean)}&count=1&language=en&format=json`,
    );
    if (!data || typeof data !== "object") return null;
    const results = (data as {
      results?: Array<{ latitude: number; longitude: number; name: string; country?: string }>;
    }).results;
    const first = results?.[0];
    if (!first || typeof first.latitude !== "number" || typeof first.longitude !== "number") return null;
    return { latitude: first.latitude, longitude: first.longitude, name: first.name, country: first.country };
  }

  private async fetchJson(url: string): Promise<unknown | null> {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(this.timeoutMs),
        next: { revalidate: 900 }, // cache per route render for 15 minutes
      });
      if (!res.ok) return null;
      return (await res.json()) as unknown;
    } catch {
      return null;
    }
  }
}
