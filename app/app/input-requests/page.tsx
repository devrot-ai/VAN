import AppShell from "@/components/app/AppShell";
import { EmptyState, Panel } from "@/components/app/ui";
import styles from "@/components/app/app.module.css";
import { listInputSupplyRequests } from "@/lib/db/supplyChain";
import { listInputSupplyRequestItems } from "@/lib/db/supplyChain";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function InputRequestsPage() {
  const user = await getCurrentUser();
  if (!user) {
    const SignInMsg = () => <div>Sign in to view input requests.</div>;
    return <AppShell allowed={["farmer", "provider", "operations"]} children={SignInMsg} />;
  }

  const requests = listInputSupplyRequests(user.id);

  // Build items and fulfilment counts
  const requestWithItems = requests.map((req) => {
    const items = listInputSupplyRequestItems(req.id);
    return { ...req, items, itemCount: items.length };
  });

  const stats = {
    total: requestWithItems.length,
    draft: requestWithItems.filter((r) => r.status === "draft").length,
    submitted: requestWithItems.filter((r) => r.status === "submitted").length,
    accepted: requestWithItems.filter((r) => r.status === "accepted").length,
    fulfilled: requestWithItems.filter((r) => r.status === "fulfilled" || r.status === "partially_fulfilled").length,
  };

  const PageContent = () => (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
          Input Requests
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          Track your agricultural input supply requests to VAN.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
        <Panel title="Total">
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.total}</div>
        </Panel>
        <Panel title="Draft">
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.draft}</div>
        </Panel>
        <Panel title="Submitted">
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.submitted}</div>
        </Panel>
        <Panel title="Accepted">
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.accepted}</div>
        </Panel>
        <Panel title="Fulfilled">
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{stats.fulfilled}</div>
        </Panel>
      </div>

      {/* Requests table */}
      <Panel title="Requests">
        {requestWithItems.length === 0 ? (
          <EmptyState text="No input requests yet. Create your first request to order agricultural inputs." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Items</th>
                  <th>Created</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requestWithItems.map((req: any) => (
                  <tr key={req.id}>
                    <td>
                      <Link href={`/app/input-requests/${req.id}`} className={styles.listLink}>
                        Request #{req.id}
                      </Link>
                      {req.delivery_location && (
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{req.delivery_location}</div>
                      )}
                    </td>
                    <td>{req.itemCount} item{req.itemCount !== 1 ? "s" : ""}</td>
                    <td>{formatDate(req.created_at)}</td>
                    <td><span className={badgeClass(req.status)}>{formatStatus(req.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Quick actions */}
      <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-3)" }}>
        <Link href="/app/inputs" className={styles.primaryBtn}>
          Browse inputs
        </Link>
      </div>
    </div>
  );

  return (
    <AppShell allowed={["farmer", "provider", "operations"]} children={PageContent} />
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
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function badgeClass(status: string): string {
  if (status === "accepted" || status === "fulfilled" || status === "partially_fulfilled") return styles.badgeSuccess;
  if (status === "submitted" || status === "under_review") return styles.badgeWarning;
  if (status === "rejected" || status === "cancelled") return styles.badgeError;
  return styles.badgeNeutral;
}
