import Link from "next/link";
import { getWeatherForPlace, type WeatherForPlace } from "@/lib/weather";
import styles from "./app.module.css";

/**
 * Live weather, fetched server-side from Open-Meteo. When no farm location is
 * set — or the service can't be reached — the panel says exactly that instead
 * of showing invented numbers.
 */
export default async function WeatherPanel({
  location,
  compact = false,
}: {
  location: string | null;
  compact?: boolean;
}) {
  const weather: WeatherForPlace | null = location ? await getWeatherForPlace(location) : null;

  if (!weather) {
    return (
      <div className={styles.weatherEmpty}>
        {location ? (
          <p>
            Live weather is unavailable right now — VAN shows real observations
            only, never estimates. Please check back shortly.
          </p>
        ) : (
          <p>
            Add your farm location under <strong>My Farm → Farm profile</strong> to
            see local weather and a short outlook here.
          </p>
        )}
        <p style={{ marginTop: "var(--space-2)" }}>
          <Link href="/app/farm">Go to My Farm</Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.weather}>
      <div className={styles.weatherNow}>
        <span className={styles.weatherTemp}>{Math.round(weather.now.temperature)}°C</span>
        <span className={styles.weatherMeta}>
          {weather.place}
          {weather.now.humidity != null ? ` · Humidity ${Math.round(weather.now.humidity)}%` : ""}
          {weather.now.windSpeed != null ? ` · Wind ${(weather.now.windSpeed).toFixed(0)} km/h` : ""}
        </span>
      </div>

      {!compact ? (
        <ul className={styles.weatherDays}>
          {weather.days.slice(1).map((d) => (
            <li key={d.date}>
              <span className={styles.weatherDay}>{new Date(d.date + "T12:00:00").toLocaleDateString("en", { weekday: "short" })}</span>
              <span>
                {Math.round(d.tempMin)}° / {Math.round(d.tempMax)}°
                {d.precipitation != null ? ` · ${d.precipitation.toFixed(1)} mm` : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <p className={styles.weatherSource}>
        Live observations from Open-Meteo · updated {weather.now.observedAt.replace("T", " ").slice(0, 16)}
      </p>
    </div>
  );
}
