import AppShell from "@/components/app/AppShell";
import { PageHeader, Stat, Panel, EmptyState, ListRow } from "@/components/app/ui";
import { listBookings, type SafeUser } from "@/lib/db";
import { presentEarningsPage } from "@/lib/presenters";
import styles from "@/components/app/app.module.css";

export default async function EarningsPage() {
  return (
    <AppShell allowed={["provider"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const bookings = listBookings(user.id);
  const data = presentEarningsPage(bookings);
  return (
    <>
      <PageHeader eyebrow="Provider · Earnings" title="Earnings & history" lead="See exactly what your equipment and services return." />
      <div className={styles.statGrid}>
        <Stat value={`$${data.stats.earned.toFixed(0)}`} label="Confirmed earnings" />
        <Stat value={String(data.stats.pending)} label="Pending" />
        <Stat value={String(data.stats.transactions)} label="Transactions" />
        <Stat value="Q3 2026" label="Current period" />
      </div>
      <Panel title="Transaction history">
        {data.jobs.length === 0 ? (
          <EmptyState text="No transactions yet." />
        ) : (
          <ul className={styles.list}>
            {data.jobs.map((j) => (
              <ListRow key={j.id} title={j.title} meta={<span>{j.counterparty ?? ""} · {j.when_date ?? ""}</span>} badge={j.status} />
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
