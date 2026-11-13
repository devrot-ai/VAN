import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, Stat } from "@/components/app/ui";
import { platformMetrics } from "@/lib/db";
import { presentOperationsPage } from "@/lib/presenters";
import styles from "@/components/app/app.module.css";

export default async function OperationsPage() {
  return (
    <AppShell allowed={["operations"]}>
      {() => {
        const metrics = platformMetrics();
        const data = presentOperationsPage(metrics);
        return (
          <>
            <PageHeader
              eyebrow="VAN Operations"
              title="Platform overview"
              lead="Internal operations view of VAN — real figures drawn from the platform database."
            />
            <div className={styles.statGrid}>
              <Stat value={String(data.metrics.users)} label="Registered users" />
              <Stat value={String(data.metrics.fields)} label="Fields recorded" />
              <Stat value={String(data.metrics.bookings)} label="Bookings" />
              <Stat value={String(data.metrics.devices)} label="Devices" />
            </div>
            <div className={styles.statGrid}>
              <Stat value={String(data.metrics.members)} label="Cooperative members" />
              <Stat value={String(data.metrics.engagements)} label="Contact messages" />
              <Stat value={String(data.metrics.earlyAccess)} label="Early-access list" />
              <Stat value="Live" label="Database status" />
            </div>
            <Panel title="Notes">
              <div className={styles.empty} style={{ textAlign: "left" }}>
                This portal is for internal VAN staff. It shows real aggregated counts from
                the platform database, alongside tools for managing the growing system.
              </div>
            </Panel>
          </>
        );
      }}
    </AppShell>
  );
}
