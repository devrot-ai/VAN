import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, ListRow, EmptyState } from "@/components/app/ui";
import AddMaintenanceForm from "@/components/app/AddMaintenanceForm";
import EditMaintenanceForm from "@/components/app/EditMaintenanceForm";
import SearchBar from "@/components/app/SearchBar";
import RowActions from "@/components/app/RowActions";
import { EditableList } from "@/components/app/EditRowWrapper";
import { listMaintenance, getEquipmentById, type MaintenanceRow, type SafeUser } from "@/lib/db";
import styles from "@/components/app/app.module.css";

export default async function MaintenancePage() {
  return (
    <AppShell allowed={["provider"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const records = listMaintenance(user.id);

  return (
    <>
      <PageHeader eyebrow="Provider · Maintenance" title="Maintenance records" lead="A structured service record for every machine." />
      <Panel title="Add maintenance record">
        <AddMaintenanceForm />
      </Panel>
      <Panel title="Maintenance schedule">
        {records.length === 0 ? (
          <EmptyState text="No maintenance records yet." />
        ) : (
          <MaintenanceList records={records} />
        )}
      </Panel>
    </>
  );
}

function MaintenanceList({ records }: { records: MaintenanceRow[] }) {
  return (
    <SearchBar
      items={records}
      keyOf={(r) => `${r.task} ${r.status}`}
      placeholder="Search maintenance…"
    >
      {(filtered) => (
        <ul className={styles.list}>
          <EditableList
            items={filtered}
            renderEdit={(r, cancel) => (
              <EditMaintenanceForm
                id={r.id}
                initial={{ equipmentId: r.equipment_id, task: r.task, dueDate: r.due_date ?? "", status: r.status, notes: r.notes ?? "" }}
                onCancel={cancel}
              />
            )}
            renderNormal={(r, setEditing) => {
              const eq = getEquipmentById(r.equipment_id);
              const itemName = eq?.name ?? `Equipment #${r.equipment_id}`;
              return (
                <li key={r.id} className={styles.listItem}>
                  <span className={styles.listTitle}>{itemName} — {r.task}</span>
                  <span className={styles.listMeta}>
                    <span>{r.due_date ?? "No due date"}</span>
                    <span className={styles.badge}>{r.status}</span>
                    <RowActions id={r.id} apiPath={`/api/maintenance?id=${r.id}`} onEdit={() => setEditing(r.id)} />
                  </span>
                </li>
              );
            }}
          />
        </ul>
      )}
    </SearchBar>
  );
}
