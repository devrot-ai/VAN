import AppShell from "@/components/app/AppShell";
import {
  PageHeader,
  Stat,
  Panel,
  EmptyState,
  ListRow,
} from "@/components/app/ui";
import { listFields, listActivities, type SafeUser } from "@/lib/db";
import { presentFarmPage, type FarmFieldItem, type FarmActivityItem } from "@/lib/presenters";
import FarmProfileForm from "@/components/app/FarmProfileForm";
import AddFieldForm from "@/components/app/AddFieldForm";
import AddActivityForm from "@/components/app/AddActivityForm";
import EditFieldForm from "@/components/app/EditFieldForm";
import EditActivityForm from "@/components/app/EditActivityForm";
import SearchBar from "@/components/app/SearchBar";
import RowActions from "@/components/app/RowActions";
import { EditableList } from "@/components/app/EditRowWrapper";
import styles from "@/components/app/app.module.css";

export default async function FarmPage() {
  return (
    <AppShell allowed={["farmer"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
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
        <Stat value={String(data.stats.fieldsCount)} label="Fields" />
        <Stat value={`${data.stats.totalAreaHa.toFixed(0)} ha`} label="Total area" />
        <Stat value={String(data.stats.fieldsUnderCrop)} label="Fields under crop" />
        <Stat value={String(data.stats.activitiesCount)} label="Activities logged" />
      </div>

      <div className={styles.grid2}>
        <Panel title="Farm profile">
          <div style={{ padding: "var(--space-5)" }}>
            <p className={styles.profileHint} style={{ marginBottom: "var(--space-3)" }}>
              {user.verified_at
                ? <>Email verified · {user.verified_at.slice(0, 10)}</>
                : <>Email not verified yet — check your verification link.</>}
            </p>
            <FarmProfileForm farmName={user.farm_name ?? ""} location={user.location ?? ""} />
          </div>
        </Panel>

        <Panel title="Fields">
          {data.fields.length === 0 ? (
            <EmptyState text="No fields yet." />
          ) : (
            <FieldsTable fields={data.fields} />
          )}
        </Panel>

        <Panel title="Activity history">
          {data.activities.length === 0 ? (
            <EmptyState text="No activities recorded yet." />
          ) : (
            <ActivitiesList activities={data.activities} />
          )}
        </Panel>
      </div>

      <div className={styles.grid2} style={{ marginTop: "var(--space-5)" }}>
        <Panel title="Add field">
          <div style={{ padding: "var(--space-5)" }}>
            <AddFieldForm />
          </div>
        </Panel>

        <Panel title="Add activity">
          <div style={{ padding: "var(--space-5)" }}>
            <AddActivityForm />
          </div>
        </Panel>
      </div>
    </>
  );
}

// --- Client components for search and edit/delete ---

function FieldsTable({ fields }: { fields: FarmFieldItem[] }) {
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
                  initial={{ name: f.name, areaHa: f.area_ha, crop: f.crop ?? "", status: f.status ?? "", notes: "" }}
                  onCancel={cancel}
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
