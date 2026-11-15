import AppShell from "@/components/app/AppShell";
import { EmptyState, Panel } from "@/components/app/ui";
import styles from "@/components/app/app.module.css";
import { listInputCatalogue } from "@/lib/db/procurement";
import { listSuppliers } from "@/lib/db/procurement";
import { getDb } from "@/lib/db/getDb";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function InputsPage() {
  const user = await getCurrentUser();
  const db = getDb();
  const inputs = listInputCatalogue();
  const suppliers = user ? listSuppliers(user.id) : [];

  // Build supplier lookup
  const supplierMap = new Map<number, any>();
  for (const s of suppliers) {
    supplierMap.set(s.id, s);
  }

  // Build supplier products lookup
  const supplierProducts = db.prepare(
    "SELECT sp.*, i.name as input_name, i.category FROM supplier_products sp JOIN input_catalogue i ON sp.input_id = i.id WHERE sp.status = 'active'"
  ).all();

  const supplierByInput = new Map<number, any[]>();
  for (const sp of supplierProducts) {
    if (sp.input_id == null) continue;
    const existing = supplierByInput.get(sp.input_id as number) || [];
    existing.push(sp);
    supplierByInput.set(sp.input_id as number, existing);
  }

  // Category counts
  const categories = [...new Set(inputs.map((i: any) => i.category))].sort();

  const PageContent = () => (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 600, color: "var(--text-primary)", marginBottom: "var(--space-1)" }}>
          Input Catalogue
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
          Agricultural inputs available through VAN. Browse products by category and view supplier offers.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}>
        <Panel title="Total Products">
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{inputs.length}</div>
        </Panel>
        <Panel title="Categories">
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{categories.length}</div>
        </Panel>
        <Panel title="Suppliers">
          <div style={{ fontSize: "var(--text-lg)", fontWeight: 600 }}>{suppliers.length}</div>
        </Panel>
      </div>

      {/* Category filters */}
      {categories.length > 0 && (
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-4)" }}>
          {categories.map((cat) => {
            const count = inputs.filter((i: any) => i.category === cat).length;
            return (
              <span key={cat} style={{
                padding: "var(--space-1) var(--space-3)",
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-sm)",
                fontSize: "var(--text-xs)",
                color: "var(--text-muted)",
              }}>
                {cat} ({count})
              </span>
            );
          })}
        </div>
      )}

      {/* Products table */}
      <Panel title="Products">
        {inputs.length === 0 ? (
          <EmptyState text="No input products in the catalogue yet." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Package</th>
                  <th>Suppliers</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inputs.map((input: any) => {
                  const offers = supplierByInput.get(input.id) || [];
                  const status = input.status || "active";
                  return (
                    <tr key={input.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{input.name}</div>
                        {input.manufacturer && (
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{input.manufacturer}</div>
                        )}
                      </td>
                      <td>{input.category}</td>
                      <td>{input.unit}</td>
                      <td>{input.package_size ? `${input.package_size} ${input.unit}` : "—"}</td>
                      <td>
                        {offers.length > 0 ? (
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                            {offers.length} offer{offers.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>No offers</span>
                        )}
                      </td>
                      <td>
                        <span className={badgeClass(status)}>{status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Quick actions */}
      <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-3)" }}>
        <Link href="/app/input-requests" className={styles.primaryBtn}>
          Request inputs
        </Link>
      </div>
    </div>
  );

  return (
    <AppShell allowed={["farmer", "provider", "operations"]} children={PageContent} />
  );
}

function badgeClass(status: string): string {
  if (status === "active") return styles.badgeSuccess;
  if (status === "inactive") return styles.badgeWarning;
  return styles.badgeNeutral;
}
