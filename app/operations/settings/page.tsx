import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, ListRow } from "@/components/app/ui";
import { config } from "@/lib/config";
import { isMailConfigured } from "@/lib/mail";
import { getDb } from "@/lib/db/getDb";
import styles from "@/components/app/app.module.css";

export default async function OperationsSettingsPage() {
  const cfg = config;
  const mailOk = isMailConfigured();
  const dbSize = (() => {
    try {
      const db = getDb();
      const row = db
        .prepare("SELECT page_count * page_size AS size FROM pragma_page_count(), pragma_page_size()")
        .get() as { size: number } | undefined;
      return row ? `${(row.size / 1024 / 1024).toFixed(1)} MB` : "unknown";
    } catch {
      return "unknown";
    }
  })();

  return (
    <AppShell allowed={["operations"]}>
      {() => (
        <>
          <PageHeader eyebrow="Operations · Settings" title="Platform settings" lead="Live configuration and system status." />
          <Panel title="System">
            <ul className={styles.list}>
              <ListRow title="Environment" meta={<span>{cfg.nodeEnv}</span>} badge={cfg.nodeEnv === "production" ? "active" : "info"} />
              <ListRow title="Base URL" meta={<span>{cfg.baseUrl}</span>} />
              <ListRow title="Database" meta={<span>{cfg.dbPath} · {dbSize}</span>} badge="active" />
              <ListRow title="Session max age" meta={<span>{(cfg.sessionMaxAge / 1000 / 60 / 60).toFixed(0)} hours</span>} />
              <ListRow title="Rate limit" meta={<span>{cfg.rateLimitMax} requests per {(cfg.rateLimitWindowMs / 1000 / 60).toFixed(0)} min</span>} />
            </ul>
          </Panel>
          <Panel title="Integrations">
            <ul className={styles.list}>
              <ListRow title="Email delivery" meta={<span>{mailOk ? "Resend configured" : "Not configured — links shown on screen"}</span>} badge={mailOk ? "active" : "pending"} />
              <ListRow title="Weather" meta={<span>{cfg.weatherMock ? "Mock provider" : "Open-Meteo API"} · {cfg.weatherCacheTtlMs / 1000 / 60} min cache</span>} badge={cfg.weatherMock ? "info" : "active"} />
              <ListRow title="AI Chat" meta={<span>{cfg.features.aiChat ? cfg.geminiModel : "No API key"}</span>} badge={cfg.features.aiChat ? "active" : "pending"} />
            </ul>
          </Panel>
          <Panel title="Feature flags">
            <ul className={styles.list}>
              <ListRow title="Notifications" meta={<span>{cfg.features.notifications ? "Enabled" : "Disabled"}</span>} badge={cfg.features.notifications ? "active" : "info"} />
              <ListRow title="Analytics" meta={<span>{cfg.features.analytics ? "Enabled" : "Disabled"}</span>} badge={cfg.features.analytics ? "active" : "info"} />
              <ListRow title="Demo seeding" meta={<span>{process.env.VAN_SEED_DEMO ? "Active" : "Inactive"}</span>} badge={process.env.VAN_SEED_DEMO ? "active" : "info"} />
            </ul>
          </Panel>
        </>
      )}
    </AppShell>
  );
}
