import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, EmptyState } from "@/components/app/ui";
import { listPurchases, type PurchaseRow, type SafeUser } from "@/lib/db";
import EditPurchaseForm from "@/components/app/EditPurchaseForm";
import SearchBar from "@/components/app/SearchBar";
import RowActions from "@/components/app/RowActions";
import PurchaseStatusActions from "@/components/app/PurchaseStatusActions";
import { EditableList } from "@/components/app/EditRowWrapper";
import styles from "@/components/app/app.module.css";

export default async function PurchasesPage() {
  return (
    <AppShell allowed={["buyer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const purchases = listPurchases(user.id);
  return (
    <>
      <PageHeader eyebrow="Buyer · Purchases" title="Purchase records" lead="Every enquiry, confirmation and delivery in one place." />
      <Panel title="Purchases">
        {purchases.length === 0 ? (
          <EmptyState text="No purchases yet." />
        ) : (
          <PurchasesTable purchases={purchases} />
        )}
      </Panel>
    </>
  );
}

function PurchasesTable({ purchases }: { purchases: PurchaseRow[] }) {
  return (
    <SearchBar
      items={purchases}
      keyOf={(p) => `${p.lot} ${p.buyer} ${p.status}`}
      placeholder="Search purchases…"
    >
      {(filtered) => (
        <table className={styles.table}>
          <thead>
            <tr><th>Lot</th><th>Seller</th><th>Volume</th><th>Amount</th><th>Status</th><th style={{ width: "120px" }}>Actions</th></tr>
          </thead>
          <tbody>
            <EditableList
              items={filtered}
              colSpan={6}
              renderEdit={(p, cancel) => (
                <EditPurchaseForm
                  id={p.id}
                  initial={{ lot: p.lot, buyer: p.buyer ?? "", quantityTonnes: p.quantity_tonnes, amount: p.amount, status: p.status }}
                  onCancel={cancel}
                />
              )}
              renderNormal={(p, setEditing) => (
                <tr key={p.id}>
                  <td><strong>{p.lot}</strong></td>
                  <td>{p.buyer ?? "—"}</td>
                  <td>{p.quantity_tonnes} t</td>
                  <td>{p.amount ? `$${p.amount}` : "—"}</td>
                  <td>{p.status}</td>
                  <td>
                    <PurchaseStatusActions purchaseId={p.id} currentStatus={p.status} />
                    <RowActions id={p.id} apiPath={`/api/purchases?id=${p.id}`} onEdit={() => setEditing(p.id)} />
                  </td>
                </tr>
              )}
            />
          </tbody>
        </table>
      )}
    </SearchBar>
  );
}
