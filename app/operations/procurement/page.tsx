import AppShell from "@/components/app/AppShell";
import { EmptyState, Panel } from "@/components/app/ui";
import styles from "@/components/app/app.module.css";
import { listProcurementOrders } from "@/lib/db/procurement";
import { getCurrentUser } from "@/lib/auth";
import { requireRole } from "@/lib/guard";
import { listGoodsReceiptsByOrder } from "@/lib/db/supplyChain";
import { getDb } from "@/lib/db/getDb";
import Link from "next/link";

export default async function ProcurementPage() {
  await requireRole(["operations"]);
  const user = await getCurrentUser();
  if (!user) {
    const SignInMsg = () => <div>Sign in to view procurement.</div>;
    return <AppShell allowed={["operations"]} children={SignInMsg} />;
  }

  const orders = listProcurementOrders(user.id);
  const db = getDb();

  // Enrich orders with receipt info
  const enrichedOrders = orders.map((order) => {
    const receipts = listGoodsReceiptsByOrder(order.id);
    const items = db.prepare("SELECT * FROM procurement_order_items WHERE order_id = ?").all(order.id);
    const totalOrdered = (items as any[]).reduce((sum: number, i: any) => sum + Number(i.quantity || 0), 0);
    const totalReceived = (items as any[]).reduce((sum: number, i: any) => sum + Number(i.received_quantity || 0), 0);
    return { ...order, receipts, items: items as any[], totalOrdered, totalReceived };
  });

  const stats = {
    total: enrichedOrders.length,
    draft: enrichedOrders.filter((o) => o.status === "draft").length,
    approved: enrichedOrders.filter((o) => o.status === "approved" || o.status === "sent_to_supplier").length,
    pending: enrichedOrders.filter((o) => o.status === "partially_received").length,
    received: enrichedOrders.filter((o) => o.status === "received").length,
  };

  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: "var(--space-5)" }}>
          <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
            Procurement
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
            Manage supplier purchase orders and track goods receipts.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Total Orders</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.total}</div>
          </Panel>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Pending</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.approved}</div>
          </Panel>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Partial Receipt</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.pending}</div>
          </Panel>
          <Panel>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-1)" }}>Received</div>
            <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.received}</div>
          </Panel>
        </div>

        {/* Orders table */}
        <Panel>
          {enrichedOrders.length === 0 ? (
            <EmptyState text="No procurement orders yet. Create your first supplier purchase order." />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Supplier</th>
                    <th>Items</th>
                    <th>Ordered</th>
                    <th>Received</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedOrders.map((order: any) => {
                    const supplier = db.prepare("SELECT name FROM suppliers WHERE id = ?").get(order.supplier_id);
                    const pct = order.totalOrdered > 0 ? Math.round((order.totalReceived / order.totalOrdered) * 100) : 0;
                    return (
                      <tr key={order.id}>
                        <td>
                          <Link href={`/operations/procurement/${order.id}`} className={styles.listLink}>
                            PO #{order.id}
                          </Link>
                        </td>
                        <td>{supplier ? (supplier as any).name : "—"}</td>
                        <td>{order.items.length}</td>
                        <td>{order.totalOrdered.toFixed(1)}</td>
                        <td>
                          <span style={{ fontSize: "var(--text-xs)" }}>
                            {order.totalReceived.toFixed(1)} ({pct}%)
                          </span>
                        </td>
                        <td><span className={badgeClass(order.status)}>{formatStatus(order.status)}</span></td>
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

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function badgeClass(status: string): string {
  if (status === "received") return styles.badgeSuccess;
  if (status === "approved" || status === "sent_to_supplier") return styles.badgeWarning;
  if (status === "partially_received") return styles.badgeInfo;
  if (status === "rejected" || status === "cancelled") return styles.badgeError;
  return styles.badgeNeutral;
}
