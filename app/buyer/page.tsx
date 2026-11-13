import AppShell from "@/components/app/AppShell";
import { PageHeader, Stat, Panel, EmptyState, ListRow } from "@/components/app/ui";
import { listPurchases, listHarvestAvailabilityRows, type SafeUser } from "@/lib/db";
import { presentBuyerDashboard } from "@/lib/presenters";
import styles from "@/components/app/app.module.css";

export default async function BuyerPage() {
  return (
    <AppShell allowed={["buyer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const purchases = listPurchases(user.id);
  const available = listHarvestAvailabilityRows();
  const data = presentBuyerDashboard(purchases, available);

  return (
    <>
      <PageHeader
        eyebrow="Buyer"
        title="Source produce with confidence."
        lead="Enquiries, harvest availability, purchases and deliveries — with a clear view of every transaction."
      />

      <div className={styles.statGrid}>
        <Stat value={String(data.stats.purchasesCount)} label="Purchase records" />
        <Stat value={`${data.stats.volumeTonnes.toFixed(0)} t`} label="Volume tracked" />
        <Stat value={String(data.stats.openEnquiries)} label="Open enquiries" />
        <Stat value={String(data.stats.confirmed)} label="Confirmed" />
      </div>

      <div className={styles.grid2}>
        <Panel title="Recent purchases" href="/buyer/purchases">
          {data.recentPurchases.length === 0 ? (
            <EmptyState text="No purchases yet." />
          ) : (
            <ul className={styles.list}>
              {data.recentPurchases.map((p) => (
                <ListRow key={p.id} title={p.lot} meta={<span>{p.buyer ?? "Seller"} · {p.quantity_tonnes} t</span>} badge={p.status} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Harvest availability" href="/buyer/availability">
          {data.harvestAvailability.length === 0 ? (
            <EmptyState text="No harvests available yet. Farmers can mark harvests as ready or available." />
          ) : (
            <ul className={styles.list}>
              {data.harvestAvailability.map((h) => (
                <ListRow
                  key={h.harvest_id}
                  title={`${h.crop} — ${h.quantity_tonnes} t`}
                  meta={<span>{h.farmer_name}{h.farm_name ? ` · ${h.farm_name}` : ""} · {h.date}</span>}
                  badge={h.status}
                />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
