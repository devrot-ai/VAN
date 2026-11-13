import AppShell from "@/components/app/AppShell";
import { PageHeader, Stat, Panel, EmptyState, ListRow } from "@/components/app/ui";
import { listEquipment, listBookings, type SafeUser } from "@/lib/db";
import { presentProviderDashboard } from "@/lib/presenters";
import styles from "@/components/app/app.module.css";

export default async function ProviderPage() {
  return (
    <AppShell allowed={["provider"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const equipment = listEquipment(user.id);
  const bookings = listBookings(user.id);
  const data = presentProviderDashboard(equipment, bookings);

  return (
    <>
      <PageHeader
        eyebrow="Provider portal"
        title="Run your equipment and services."
        lead="List machines, manage booking requests, and see what your operation returns."
      />

      <div className={styles.statGrid}>
        <Stat value={String(data.stats.equipmentCount)} label="Listed equipment" />
        <Stat value={String(data.stats.availableCount)} label="Available now" />
        <Stat value={String(data.stats.pendingRequests)} label="Pending requests" />
        <Stat value={String(data.stats.confirmedJobs)} label="Confirmed jobs" />
      </div>

      <div className={styles.grid2}>
        <Panel title="Equipment" href="/provider/equipment">
          {data.equipment.length === 0 ? (
            <EmptyState text="No equipment listed yet." />
          ) : (
            <ul className={styles.list}>
              {data.equipment.map((e) => (
                <ListRow key={e.id} title={e.name} meta={<span>{e.category} · {e.location}</span>} badge={e.status} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Booking requests" href="/provider/requests">
          {data.requests.length === 0 ? (
            <EmptyState text="No booking requests yet." />
          ) : (
            <ul className={styles.list}>
              {data.requests.map((r) => (
                <ListRow key={r.id} title={r.title} meta={<span>{r.counterparty ?? ""} · {r.when_date ?? ""}</span>} badge={r.status} />
              ))}
            </ul>
          )}
        </Panel>
      </div>

    </>
  );
}
