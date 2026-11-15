import AppShell from "@/components/app/AppShell";
import { EmptyState, Panel } from "@/components/app/ui";
import styles from "@/components/app/app.module.css";
import { listFulfilmentRecordsByFarm } from "@/lib/db/supplyChain";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/guard";
import { getDb } from "@/lib/db/getDb";
import Link from "next/link";

export default async function FulfilmentPage() {
  await requireRole(["operations"]);
  const user = await getCurrentUser();
  if (!user) {
    const SignInMsg = () => <div>Sign in to view fulfilment.</div>;
    return <AppShell allowed={["operations"]} children={SignInMsg} />;
  }

  const db = getDb();
  const farms = db.prepare("SELECT id, name FROM farms WHERE user_id = ?").all(user.id) as any[];

  // Collect all fulfilment records for user's farms
  const allFulfilments: any[] = [];
  for (const farm of farms) {
    const records = listFulfilmentRecordsByFarm(farm.id);
    for (const rec of records) {
      allFulfilments.push({ ...rec, farmName: farm.name });
    }
  }

  const stats = {
    total: allFulfilments.length,
    allocated: allFulfilments.filter((f) => f.status === "allocated").length,
    dispatched: allFulfilments.filter((f) => f.status === "dispatched").length,
    delivered: allFulfilments.filter((f) => f.status === "delivered").length,
  };

  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "var(--space-5)" }}>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            Fulfilment
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Track stock allocation, dispatch and delivery to farms.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Total</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.total}</div>
          </Panel>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Allocated</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.allocated}</div>
          </Panel>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Dispatched</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.dispatched}</div>
          </Panel>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Delivered</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.delivered}</div>
          </Panel>
        </div>

        {/* Fulfilment table */}
        <Panel>
          {allFulfilments.length === 0 ? (
            <EmptyState text="No fulfilment records yet. Fulfilments appear when stock is allocated to farmer requests." />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fulfilment</th>
                    <th>Farm</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Allocated</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allFulfilments.map((rec: any) => {
                    const product = db.prepare("SELECT name FROM input_catalogue WHERE id = ?").get(rec.input_id);
                    return (
                      <tr key={rec.id}>
                        <td>
                          <Link href={`/operations/fulfilment/${rec.id}`} className={styles.listLink}>
                            #{rec.id}
                          </Link>
                        </td>
                        <td>{rec.farmName || "—"}</td>
                        <td>{product ? (product as any).name : "—"}</td>
                        <td>{rec.quantity} {rec.unit}</td>
                        <td>{formatDate(rec.allocated_at)}</td>
                        <td><span className={badgeClass(rec.status)}>{formatStatus(rec.status)}</span></td>
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

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function badgeClass(status: string): string {
  if (status === "delivered") return styles.badgeSuccess;
  if (status === "dispatched") return styles.badgeInfo;
  if (status === "allocated") return styles.badgeWarning;
  if (status === "cancelled") return styles.badgeError;
  return styles.badgeNeutral;
}
