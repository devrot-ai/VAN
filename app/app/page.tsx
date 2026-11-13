import AppShell from "@/components/app/AppShell";
import WeatherPanel from "@/components/app/WeatherPanel";
import AnalyticsBar from "@/components/app/AnalyticsBar";
import { PageHeader, Stat, Panel, EmptyState, ListRow, badgeClass } from "@/components/app/ui";
import {
  listFields,
  listActivities,
  listBookings,
  listDevices,
  type SafeUser,
} from "@/lib/db";
import { presentFarmerDashboard } from "@/lib/presenters";
import styles from "@/components/app/app.module.css";

export default async function FarmerHome() {
  return (
    <AppShell allowed={["farmer"]}>
      {(user) => <FarmerDashboard user={user} />}
    </AppShell>
  );
}

async function FarmerDashboard({ user }: { user: SafeUser }) {
  const fields = listFields(user.id);
  const activities = listActivities(user.id);
  const bookings = listBookings(user.id);
  const devices = listDevices(user.id);

  const data = presentFarmerDashboard(fields, activities, bookings, devices);

  return (
    <>
      <PageHeader
        eyebrow="Farm control centre"
        title="Farm overview"
        lead="Fields, work queue, bookings and connected equipment in one place."
      />

      <div className={styles.statGrid}>
        <Stat value={String(data.stats.fieldsCount)} label="Fields" />
        <Stat value={`${data.stats.areaHa.toFixed(0)} ha`} label="Under management" />
        <Stat value={String(data.stats.activeBookings)} label="Active bookings" />
        <Stat value={data.stats.devicesOnline} label="Devices online" />
      </div>

      <div className={styles.grid2}>
        <Panel title="Upcoming activities" href="/app/farm">
          {data.openActivities.length === 0 ? (
            <EmptyState text="No outstanding activities." />
          ) : (
            <ul className={styles.list}>
              {data.openActivities.map((a) => (
                <ListRow
                  key={a.id}
                  title={a.title}
                  meta={
                    <>
                      <span>{a.due_date ?? "No date"}</span>
                      <span className={styles.badge}>{a.category}</span>
                    </>
                  }
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent bookings" href="/app/machinery">
          {data.recentBookings.length === 0 ? (
            <EmptyState text="No bookings yet." />
          ) : (
            <ul className={styles.list}>
              {data.recentBookings.map((b) => (
                <ListRow
                  key={b.id}
                  title={b.title}
                  meta={
                    <>
                      <span>{b.when_date ?? "No date"}</span>
                      <span className={badgeClass(b.status)}>{b.status}</span>
                    </>
                  }
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className={styles.grid2} style={{ marginTop: "var(--space-5)" }}>
        <Panel title="Fields at a glance" href="/app/farm">
          <ul className={styles.list}>
            {data.fieldsAtAGlance.map((f) => (
              <ListRow
                key={f.id}
                title={f.name}
                meta={
                  <>
                    <span>{f.area_ha} ha</span>
                    <span>{f.crop ?? "—"}</span>
                    <span className={styles.badge}>{f.status}</span>
                  </>
                }
              />
            ))}
          </ul>
        </Panel>

        <WeatherPanel location={user.location} compact />
      </div>

      {data.fieldAnalytics.length > 0 || data.activityAnalytics.length > 0 ? (
        <div className={styles.grid2} style={{ marginTop: "var(--space-5)" }}>
          {data.fieldAnalytics.length > 0 ? (
            <Panel title="Field status breakdown">
              <AnalyticsBar items={data.fieldAnalytics} />
            </Panel>
          ) : null}
          {data.activityAnalytics.length > 0 ? (
            <Panel title="Activity categories">
              <AnalyticsBar items={data.activityAnalytics} />
            </Panel>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
