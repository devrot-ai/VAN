/**
 * Shared weather types — used by the provider interface and all adapters.
 */

export type WeatherNow = {
  temperature: number;
  humidity: number | null;
  windSpeed: number | null;
  precipitation: number | null;
  observedAt: string;
};

export type WeatherDay = {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number | null;
};

export type WeatherForPlace = {
  place: string;
  now: WeatherNow;
  days: WeatherDay[];
};
