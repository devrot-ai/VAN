import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, EmptyState, ListRow } from "@/components/app/ui";
import { listPurchases, type SafeUser } from "@/lib/db";
import styles from "@/components/app/app.module.css";

export default async function DeliveriesPage() {
  return (
    <AppShell allowed={["buyer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const deliveries = listPurchases(user.id).filter((p) => p.status === "scheduled" || p.status === "confirmed");
  return (
    <>
      <PageHeader eyebrow="Buyer · Deliveries" title="Deliveries" lead="Scheduled and confirmed loads, with volume and timing." />
      <Panel title="Deliveries">
        {deliveries.length === 0 ? (
          <EmptyState text="No deliveries scheduled." />
        ) : (
          <ul className={styles.list}>
            {deliveries.map((d) => (
              <ListRow key={d.id} title={d.lot} meta={<span>{d.buyer ?? "Seller"} · {d.quantity_tonnes} t</span>} badge={d.status} />
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
