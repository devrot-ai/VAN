import AppShell from "@/components/app/AppShell";
import AddEnquiryForm from "@/components/app/AddEnquiryForm";
import { PageHeader, Panel, EmptyState, ListRow } from "@/components/app/ui";
import { listPurchases, type PurchaseRow, type SafeUser } from "@/lib/db";
import EditPurchaseForm from "@/components/app/EditPurchaseForm";
import SearchBar from "@/components/app/SearchBar";
import RowActions from "@/components/app/RowActions";
import PurchaseStatusActions from "@/components/app/PurchaseStatusActions";
import { EditableList } from "@/components/app/EditRowWrapper";
import styles from "@/components/app/app.module.css";

export default async function EnquiriesPage() {
  return (
    <AppShell allowed={["buyer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const enquiries = listPurchases(user.id).filter((p) => p.status === "enquiry");
  return (
    <>
      <PageHeader eyebrow="Buyer · Enquiries" title="Open enquiries" lead="Track questions to farms and follow up on availability." />
      <div className={styles.grid2}>
        <Panel title="Create enquiry">
          <AddEnquiryForm />
        </Panel>
        <Panel title="Enquiries">
          {enquiries.length === 0 ? (
            <EmptyState text="No open enquiries." />
          ) : (
            <EnquiriesList enquiries={enquiries} />
          )}
        </Panel>
      </div>
    </>
  );
}

function EnquiriesList({ enquiries }: { enquiries: PurchaseRow[] }) {
  return (
    <SearchBar
      items={enquiries}
      keyOf={(p) => `${p.lot} ${p.buyer}`}
      placeholder="Search enquiries…"
    >
      {(filtered) => (
        <ul className={styles.list}>
          <EditableList
            items={filtered}
            renderEdit={(p, cancel) => (
              <EditPurchaseForm
                id={p.id}
                initial={{ lot: p.lot, buyer: p.buyer ?? "", quantityTonnes: p.quantity_tonnes, amount: p.amount, status: p.status }}
                onCancel={cancel}
              />
            )}
            renderNormal={(p, setEditing) => (
              <li key={p.id} className={styles.listItem}>
                <span className={styles.listTitle}>{p.lot}</span>
                <span className={styles.listMeta}>
                  <span>{p.buyer ?? "Seller"} · {p.quantity_tonnes} t</span>
                  <span className={styles.badge}>{p.status}</span>
                  <PurchaseStatusActions purchaseId={p.id} currentStatus={p.status} />
                  <RowActions id={p.id} apiPath={`/api/purchases?id=${p.id}`} onEdit={() => setEditing(p.id)} />
                </span>
              </li>
            )}
          />
        </ul>
      )}
    </SearchBar>
  );
}
