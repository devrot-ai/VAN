import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, Stat } from "@/components/app/ui";
import { platformMetrics } from "@/lib/db";
import styles from "@/components/app/app.module.css";

export default async function OperationsActivityPage() {
  return (
    <AppShell allowed={["operations"]}>
      {() => {
        const m = platformMetrics();
        return (
          <>
            <PageHeader eyebrow="Operations · Activity" title="Platform activity" lead="A live picture of how the platform is being used." />
            <div className={styles.statGrid}>
              <Stat value={String(m.users)} label="Users" />
              <Stat value={String(m.fields)} label="Fields" />
              <Stat value={String(m.bookings)} label="Bookings" />
              <Stat value={String(m.devices)} label="Devices" />
            </div>
            <Panel title="Recent activity feed">
              <div className={styles.empty} style={{ textAlign: "left" }}>
                New accounts, bookings, early-access signups and support messages will
                stream here in real time as the platform grows.
              </div>
            </Panel>
          </>
        );
      }}
    </AppShell>
  );
}
