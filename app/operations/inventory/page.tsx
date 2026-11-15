import AppShell from "@/components/app/AppShell";
import { EmptyState, Panel } from "@/components/app/ui";
import styles from "@/components/app/app.module.css";
import { listInventory } from "@/lib/db/inventory";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/db/getDb";

export default async function InventoryPage() {
  await requireRole(["operations"]);
  const user = await getCurrentUser();
  if (!user) {
    const SignInMsg = () => <div>Sign in to view inventory.</div>;
    return <AppShell allowed={["operations"]} children={SignInMsg} />;
  }

  const inventory = listInventory(user.id);
  const db = getDb();

  // Enrich with product names
  const enriched = inventory.map((inv) => {
    const product = db.prepare("SELECT name, category, unit FROM input_catalogue WHERE id = ?").get(inv.input_id);
    return { ...inv, product: product as any };
  });

  const totalOnHand = enriched.reduce((sum: number, i: any) => sum + Number(i.quantity_available || 0), 0);
  const totalReserved = enriched.reduce((sum: number, i: any) => sum + Number(i.quantity_reserved || 0), 0);

  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "var(--space-5)" }}>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            Inventory
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Track agricultural input stock levels, reservations, and movements.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Products in Stock</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{enriched.length}</div>
          </Panel>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Total On Hand</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{totalOnHand.toFixed(1)}</div>
          </Panel>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Total Reserved</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{totalReserved.toFixed(1)}</div>
          </Panel>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Available</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{(totalOnHand - totalReserved).toFixed(1)}</div>
          </Panel>
        </div>

        {/* Inventory table */}
        <Panel>
          {enriched.length === 0 ? (
            <EmptyState text="No inventory records yet. Stock will appear after goods receipts are processed." />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>On Hand</th>
                    <th>Reserved</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {enriched.map((inv: any) => {
                    const available = Number(inv.quantity_available || 0) - Number(inv.quantity_reserved || 0);
                    return (
                      <tr key={inv.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{inv.product?.name || "—"}</div>
                        </td>
                        <td>{inv.product?.category || "—"}</td>
                        <td>{inv.location || "—"}</td>
                        <td>{Number(inv.quantity_available || 0).toFixed(1)}</td>
                        <td>{Number(inv.quantity_reserved || 0).toFixed(1)}</td>
                        <td>
                          <span style={{ color: available <= 0 ? "var(--text-error)" : "inherit" }}>
                            {available.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
