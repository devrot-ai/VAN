"use client";

import styles from "./app.module.css";

/**
 * Simple CSS-based horizontal bar chart. No external chart library.
 * Each bar shows a label, value, and percentage width.
 */
export default function AnalyticsBar({
  items,
}: {
  items: { label: string; value: number; color?: string }[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className={styles.analyticsBar}>
      {items.map((item) => {
        const pct = Math.round((item.value / max) * 100);
        return (
          <div key={item.label} className={styles.analyticsBarRow}>
            <span className={styles.analyticsBarLabel}>{item.label}</span>
            <div className={styles.analyticsBarTrack}>
              <div
                className={styles.analyticsBarFill}
                style={{
                  width: `${pct}%`,
                  background: item.color || "var(--color-green)",
                }}
              />
            </div>
            <span className={styles.analyticsBarValue}>{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
