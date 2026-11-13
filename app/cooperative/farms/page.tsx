import AppShell from "@/components/app/AppShell";
import { PageHeader, Panel, EmptyState } from "@/components/app/ui";
import { listMembers, type SafeUser } from "@/lib/db";
import styles from "@/components/app/app.module.css";

export default async function FarmsPage() {
  return (
    <AppShell allowed={["cooperative"]}>
      {(user) => <Inner user={user} />}
    </AppShell>
  );
}

async function Inner({ user }: { user: SafeUser }) {
  const members = listMembers(user.id);
  return (
    <>
      <PageHeader eyebrow="Cooperative · Farms" title="Field overview" lead="An authorised overview of member farms and their fields." />
      <Panel title="Member farms">
        {members.length === 0 ? (
          <EmptyState text="No member farms yet." />
        ) : (
          <ul className={styles.list}>
            {members.map((m) => (
              <li key={m.id} className={styles.listItem}>
                <span className={styles.listTitle}>{m.name}</span>
                <span className={styles.listMeta}>
                  <span>{m.farm ?? "—"}</span>
                  <span>{m.fields_count} fields</span>
                  <span>{m.status}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
