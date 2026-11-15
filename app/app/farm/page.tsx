import AppShell from "@/components/app/AppShell";
import {
  PageHeader,
  Stat,
  Panel,
  EmptyState,
  ListRow,
} from "@/components/app/ui";
import { listFields, listActivities, type SafeUser } from "@/lib/db";
import { listFarmsService, getFarmOverviewService } from "@/lib/services";
import { presentFarmPage, type FarmFieldItem, type FarmActivityItem } from "@/lib/presenters";
import FarmProfileForm from "@/components/app/FarmProfileForm";
import AddFieldForm from "@/components/app/AddFieldForm";
import AddActivityForm from "@/components/app/AddActivityForm";
import EditFieldForm from "@/components/app/EditFieldForm";
import EditFarmForm from "@/components/app/EditFarmForm";
import EditActivityForm from "@/components/app/EditActivityForm";
import SearchBar from "@/components/app/SearchBar";
import RowActions from "@/components/app/RowActions";
import { EditableList } from "@/components/app/EditRowWrapper";
import AddFarmForm from "@/components/app/AddFarmForm";
import styles from "@/components/app/app.module.css";
import Link from "next/link";

export default async function FarmPage() {
  return (
    <AppShell allowed={["farmer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const farms = listFarmsService(user.id);
  const fields = listFields(user.id);
  const activities = listActivities(user.id);
  const data = presentFarmPage(fields, activities);

  return (
    <>
      <PageHeader
        eyebrow="My Farm"
        title="Your farm at a glance."
        lead="A living record of your fields, crops and history — the foundation for everything else in VAN."
      />

      <div className={styles.statGrid}>
        <Stat value={String(farms.length)} label="Farms" />
        <Stat value={String(data.stats.fieldsCount)} label="Fields" />
        <Stat value={`${data.stats.totalAreaHa.toFixed(0)} ha`} label="Total area" />
        <Stat value={String(data.stats.activitiesCount)} label="Activities logged" />
      </div>

      {/* Farms section */}
      <div className={styles.grid2}>
        <Panel title="Farms" href="/app/farm" actionLabel="View all →">
          {farms.length === 0 ? (
            <EmptyState text="No farms registered yet. Create your first farm below." />
          ) : (
            <FarmsList farms={farms} fields={fields} />
          )}
        </Panel>

        <Panel title="Create farm">
          <div style={{ padding: "var(--space-5)" }}>
            <AddFarmForm />
          </div>
        </Panel>
      </div>

      {/* Fields section */}
      <div className={styles.grid2} style={{ marginTop: "var(--space-5)" }}>
        <Panel title="Fields">
          {data.fields.length === 0 ? (
            <EmptyState text="No fields yet. Add your first field below." />
          ) : (
            <FieldsTable fields={data.fields} farms={farms} />
          )}
        </Panel>

        <Panel title="Add field">
          <div style={{ padding: "var(--space-5)" }}>
            <AddFieldForm />
          </div>
        </Panel>
      </div>

      {/* Activity history */}
      <div style={{ marginTop: "var(--space-5)" }}>
        <Panel title="Activity history">
          {data.activities.length === 0 ? (
            <EmptyState text="No activities recorded yet." />
          ) : (
            <ActivitiesList activities={data.activities} />
          )}
        </Panel>
      </div>

      {/* Quick links */}
      <div className={styles.grid2} style={{ marginTop: "var(--space-5)" }}>
        <Panel title="Land Intelligence">
          <div style={{ padding: "var(--space-5)" }}>
            <p className="text-sm text-gray-600 mb-3">
              Assess your fields, record soil measurements and track land quality.
            </p>
            <Link href="/app/intelligence" className="text-sm font-medium text-[#728B51] hover:underline">
              Open Land Intelligence →
            </Link>
          </div>
        </Panel>

        <Panel title="Crop Planning">
          <div style={{ padding: "var(--space-5)" }}>
            <p className="text-sm text-gray-600 mb-3">
              Plan crop cycles, track growth stages and manage input requirements.
            </p>
            <Link href="/app/crop-planning" className="text-sm font-medium text-[#728B51] hover:underline">
              Open Crop Planning →
            </Link>
          </div>
        </Panel>
      </div>

      <div className={styles.grid2} style={{ marginTop: "var(--space-5)" }}>
        <Panel title="Add activity">
          <div style={{ padding: "var(--space-5)" }}>
            <AddActivityForm />
          </div>
        </Panel>
      </div>
    </>
  );
}

function badgeClass(status: string) {
  if (status === "active" || status === "confirmed") return `${styles.badge} ${styles.badgeLive}`;
  if (status === "inactive" || status === "pending") return `${styles.badge} ${styles.badgeMilestone}`;
  return styles.badge;
}

// --- Client component for farms list with edit/delete ---

function FarmsList({
  farms,
  fields,
}: {
  farms: Array<{ id: number; name: string; address: string | null; total_area_ha: number; status: string }>;
  fields: Array<{ id: number; farm_id: number | null }>;
}) {
  return (
    <SearchBar
      items={farms}
      keyOf={(f) => `${f.name} ${f.status}`}
      placeholder="Search farms…"
    >
      {(filtered) => (
        <ul className={styles.list}>
          <EditableList
            items={filtered}
            renderEdit={(f, cancel) => (
              <EditFarmForm
                id={f.id}
                initial={{ name: f.name, address: f.address ?? "", totalAreaHa: f.total_area_ha, status: f.status ?? "active" }}
                onCancel={cancel}
              />
            )}
            renderNormal={(f, setEditing) => {
              const farmFields = fields.filter((fl) => fl.farm_id === f.id);
              return (
                <li key={f.id} className={styles.listItem}>
                  <div>
                    <span className={styles.listTitle}>{f.name}</span>
                    <span className={styles.listMeta}>
                      <span>{farmFields.length} field{farmFields.length !== 1 ? "s" : ""}</span>
                      <span>{f.total_area_ha.toFixed(1)} ha</span>
                    </span>
                  </div>
                  <span className={styles.listMeta}>
                    {f.address ? <span>{f.address}</span> : null}
                    <span className={badgeClass(f.status)}>{f.status}</span>
                    <RowActions id={f.id} apiPath={`/api/farms?id=${f.id}`} onEdit={() => setEditing(f.id)} />
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

// --- Client components for search and edit/delete ---

function FieldsTable({ fields, farms }: { fields: FarmFieldItem[]; farms: Array<{ id: number; name: string }> }) {
  return (
    <SearchBar
      items={fields}
      keyOf={(f) => `${f.name} ${f.crop} ${f.status}`}
      placeholder="Search fields…"
    >
      {(filtered) => (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Field</th><th>Area</th><th>Crop</th><th>Status</th><th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <EditableList
              items={filtered}
              colSpan={5}
              renderEdit={(f, cancel) => (
                <EditFieldForm
                  id={f.id}
                  initial={{ name: f.name, areaHa: f.area_ha, crop: f.crop ?? "", status: f.status ?? "", notes: "", farmId: f.farm_id ?? null }}
                  onCancel={cancel}
                  farms={farms}
                />
              )}
              renderNormal={(f, setEditing) => (
                <tr key={f.id}>
                  <td><strong>{f.name}</strong></td>
                  <td>{f.area_ha} ha</td>
                  <td>{f.crop ?? "—"}</td>
                  <td>{f.status}</td>
                  <td>
                    <RowActions id={f.id} apiPath={`/api/fields?id=${f.id}`} onEdit={() => setEditing(f.id)} />
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

function ActivitiesList({ activities }: { activities: FarmActivityItem[] }) {
  return (
    <SearchBar
      items={activities}
      keyOf={(a) => `${a.title} ${a.category}`}
      placeholder="Search activities…"
    >
      {(filtered) => (
        <ul className={styles.list}>
          <EditableList
            items={filtered}
            renderEdit={(a, cancel) => (
              <EditActivityForm
                id={a.id}
                initial={{ title: a.title, dueDate: a.due_date ?? "", category: a.category ?? "", done: a.done }}
                onCancel={cancel}
              />
            )}
            renderNormal={(a, setEditing) => (
              <li key={a.id} className={styles.listItem}>
                <span className={styles.listTitle}>{a.title}</span>
                <span className={styles.listMeta}>
                  <span>{a.due_date ?? "No date"}</span>
                  {a.category ? <span className={styles.badge}>{a.category}</span> : null}
                  <RowActions id={a.id} apiPath={`/api/activities?id=${a.id}`} onEdit={() => setEditing(a.id)} />
                </span>
              </li>
            )}
          />
        </ul>
      )}
    </SearchBar>
  );
}
