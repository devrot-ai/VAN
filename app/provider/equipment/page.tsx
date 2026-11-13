import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, EmptyState } from "@/components/app/ui";
import { listEquipment, type EquipmentRow, type SafeUser } from "@/lib/db";
import AddEquipmentForm from "@/components/app/AddEquipmentForm";
import EditEquipmentForm from "@/components/app/EditEquipmentForm";
import SearchBar from "@/components/app/SearchBar";
import RowActions from "@/components/app/RowActions";
import { EditableList } from "@/components/app/EditRowWrapper";
import styles from "@/components/app/app.module.css";

export default async function EquipmentPage() {
  return (
    <AppShell allowed={["provider"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const equipment = listEquipment(user.id);
  return (
    <>
      <PageHeader eyebrow="Provider · Equipment" title="Your fleet" lead="Keep your equipment current with photos, specs, pricing and availability." />
      <Panel title="Equipment inventory">
        {equipment.length === 0 ? (
          <EmptyState text="No equipment listed yet." />
        ) : (
          <EquipmentTable equipment={equipment} />
        )}
      </Panel>

      <div style={{ marginTop: "var(--space-5)" }}>
        <Panel title="List new equipment">
          <div style={{ padding: "var(--space-5)" }}>
            <AddEquipmentForm />
          </div>
        </Panel>
      </div>
    </>
  );
}

function EquipmentTable({ equipment }: { equipment: EquipmentRow[] }) {
  return (
    <SearchBar
      items={equipment}
      keyOf={(e) => `${e.name} ${e.category} ${e.location}`}
      placeholder="Search equipment…"
    >
      {(filtered) => (
        <table className={styles.table}>
          <thead>
            <tr><th>Equipment</th><th>Category</th><th>Daily rate</th><th>Location</th><th>Status</th><th style={{ width: "120px" }}>Actions</th></tr>
          </thead>
          <tbody>
            <EditableList
              items={filtered}
              colSpan={6}
              renderEdit={(e, cancel) => (
                <EditEquipmentForm
                  id={e.id}
                  initial={{ name: e.name, category: e.category ?? "", status: e.status, dailyRate: e.daily_rate ?? 0, location: e.location ?? "" }}
                  onCancel={cancel}
                />
              )}
              renderNormal={(e, setEditing) => (
                <tr key={e.id}>
                  <td><strong>{e.name}</strong></td>
                  <td>{e.category}</td>
                  <td>{e.daily_rate ? `$${e.daily_rate}` : "—"}</td>
                  <td>{e.location ?? "—"}</td>
                  <td>{e.status}</td>
                  <td>
                    <RowActions id={e.id} apiPath={`/api/equipment?id=${e.id}`} onEdit={() => setEditing(e.id)} />
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
