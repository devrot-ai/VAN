import AppShell from "@/components/app/AppShell";
import WeatherPanel from "@/components/app/WeatherPanel";
import {
  PageHeader,
  Panel,
  EmptyState,
  ListRow,
} from "@/components/app/ui";
import { listFields, type SafeUser } from "@/lib/db";
import { presentIntelligencePage } from "@/lib/presenters";
import styles from "@/components/app/app.module.css";

export default async function IntelligencePage() {
  return (
    <AppShell allowed={["farmer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const fields = listFields(user.id);
  const data = presentIntelligencePage(fields);

  return (
    <>
      <PageHeader
        eyebrow="Intelligence"
        title="Understand your fields, not just see them."
        lead="Weather, crop monitoring and field records come together here. Remote sensing and yield estimation are added when real, validated integrations exist."
      />

      <div className={styles.grid2}>
        <Panel title="Field-level observations">
          {data.fields.length === 0 ? (
            <EmptyState text="No fields to observe yet." />
          ) : (
            <ul className={styles.list}>
              {data.fields.map((f) => (
                <ListRow
                  key={f.id}
                  title={f.name}
                  meta={<span>{f.crop ?? "No crop"} · {f.area_ha} ha</span>}
                  badge={f.status}
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Weather — live">
          <WeatherPanel location={user.location} />
        </Panel>
      </div>

      <div className={styles.panel} style={{ marginTop: "var(--space-5)" }}>
        <div className={styles.panelHeader}><span>Capability notes</span></div>
        <ul className={styles.list}>
          <ListRow title="Satellite observations" meta={<span>Not yet integrated — will appear here when a real feed is connected.</span>} />
          <ListRow title="Yield estimation" meta={<span>Requires a validated model — not shown until then.</span>} />
          <ListRow title="Historical performance" meta={<span>Rebuilds from your own field and activity records over time.</span>} />
        </ul>
      </div>

    </>
  );
}
